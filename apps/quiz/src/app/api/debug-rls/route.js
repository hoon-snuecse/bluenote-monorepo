import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    env: {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'NOT_SET',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'NOT_SET',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET'
    },
    tests: {}
  }

  // Test with Service Role Key
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Test 1: Simple select
    try {
      const { data, error, count } = await adminClient
        .from('quizzes')
        .select('id', { count: 'exact', head: true })
      
      results.tests.selectTest = {
        success: !error,
        error: error?.message || null,
        code: error?.code || null,
        count: count
      }
    } catch (e) {
      results.tests.selectTest = {
        success: false,
        error: e.message
      }
    }

    // Test 2: Insert test
    try {
      const testQuiz = {
        user_email: 'debug@test.com',
        title: 'Debug Test ' + Date.now(),
        topic: 'Debug',
        description: 'Testing Service Role Key',
        total_questions: 0,
        status: 'draft',
        is_public: false,
        is_shared: false,
        is_sample: false,
        tags: []
      }

      const { data, error } = await adminClient
        .from('quizzes')
        .insert(testQuiz)
        .select()
        .single()

      if (data) {
        // Clean up
        await adminClient
          .from('quizzes')
          .delete()
          .eq('id', data.id)

        results.tests.insertTest = {
          success: true,
          message: 'Insert successful and cleaned up'
        }
      } else {
        results.tests.insertTest = {
          success: false,
          error: error?.message || 'Unknown error',
          code: error?.code || null,
          hint: error?.hint || null,
          details: error?.details || null
        }
      }
    } catch (e) {
      results.tests.insertTest = {
        success: false,
        error: e.message
      }
    }
  } else {
    results.tests = {
      error: 'Service Role Key or Supabase URL not configured'
    }
  }

  // Test with ANON Key (should fail)
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    try {
      const { data, error } = await anonClient
        .from('quizzes')
        .select('id')
        .limit(1)
      
      results.tests.anonTest = {
        success: !error,
        shouldFail: true,
        error: error?.message || null,
        code: error?.code || null
      }
    } catch (e) {
      results.tests.anonTest = {
        success: false,
        error: e.message
      }
    }
  }

  return NextResponse.json(results, {
    headers: {
      'Cache-Control': 'no-store'
    }
  })
}