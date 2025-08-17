import { NextResponse } from 'next/server';
// Removed next-auth import
import { checkAuth } from '@/lib/supabase-auth-helpers';

export async function GET() {
  try {
    const { error: authError } = await checkAuth('admin');
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    // 직접 SQL 쿼리로 테스트
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const results = {
      env: {
        hasUrl: !!SUPABASE_URL,
        hasServiceKey: !!SUPABASE_SERVICE_KEY,
        hasAnonKey: !!SUPABASE_ANON_KEY,
        serviceKeyLength: SUPABASE_SERVICE_KEY?.length || 0,
        serviceKeyPrefix: SUPABASE_SERVICE_KEY?.substring(0, 20) || 'missing',
      }
    };

    // Service role key로 직접 API 호출
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/research_posts?select=count`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Prefer': 'count=exact',
              'Range-Unit': 'items'
            }
          }
        );

        results.directApiCall = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          contentRange: response.headers.get('content-range')
        };

        if (!response.ok) {
          const errorText = await response.text();
          results.directApiCall.error = errorText;
        }
      } catch (error) {
        results.directApiCall = { error: error.message };
      }
    }

    // Anon key로 테스트
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/research_posts?select=count`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'count=exact',
              'Range-Unit': 'items'
            }
          }
        );

        results.anonApiCall = {
          status: response.status,
          statusText: response.statusText,
          contentRange: response.headers.get('content-range')
        };
      } catch (error) {
        results.anonApiCall = { error: error.message };
      }
    }

    return NextResponse.json(results);

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test Direct API Error', 
      message: error.message 
    }, { status: 500 });
  }
}