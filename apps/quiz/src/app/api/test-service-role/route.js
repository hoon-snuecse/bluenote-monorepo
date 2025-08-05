import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    console.log('[test-service-role] Starting test')
    
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('[test-service-role] Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      serviceKeyLength: serviceRoleKey?.length,
      hasAnonKey: !!anonKey,
      anonKeyLength: anonKey?.length
    })
    
    // 1. Anon 클라이언트 테스트
    console.log('[test-service-role] Testing anon client')
    const anonClient = createClient(supabaseUrl, anonKey)
    const { data: anonData, error: anonError } = await anonClient
      .from('quizzes')
      .select('id')
      .limit(1)
    
    console.log('[test-service-role] Anon client result:', { 
      success: !anonError, 
      error: anonError?.message 
    })
    
    // 2. Service Role 클라이언트 테스트
    console.log('[test-service-role] Testing service role client')
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('quizzes')
      .select('id')
      .limit(1)
    
    console.log('[test-service-role] Service role client result:', { 
      success: !serviceError, 
      error: serviceError?.message 
    })
    
    // 3. Service Role로 INSERT 테스트
    console.log('[test-service-role] Testing INSERT with service role')
    const testQuiz = {
      user_email: 'test@example.com',
      title: 'Service Role Test ' + new Date().toISOString(),
      topic: 'Test',
      description: 'Testing service role access',
      total_questions: 0,
      status: 'draft',
      is_public: false,
      is_shared: false,
      is_sample: false,
      tags: []
    }
    
    const { data: insertData, error: insertError } = await serviceClient
      .from('quizzes')
      .insert(testQuiz)
      .select()
      .single()
    
    console.log('[test-service-role] INSERT result:', { 
      success: !insertError, 
      error: insertError?.message,
      id: insertData?.id
    })
    
    // 4. 생성된 데이터 삭제 (정리)
    if (insertData?.id) {
      await serviceClient
        .from('quizzes')
        .delete()
        .eq('id', insertData.id)
      console.log('[test-service-role] Test data cleaned up')
    }
    
    return NextResponse.json({
      environment: {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
        serviceKeyLength: serviceRoleKey?.length,
        hasAnonKey: !!anonKey
      },
      tests: {
        anonSelect: { success: !anonError, error: anonError?.message },
        serviceSelect: { success: !serviceError, error: serviceError?.message },
        serviceInsert: { success: !insertError, error: insertError?.message }
      }
    })
    
  } catch (error) {
    console.error('[test-service-role] Unexpected error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}