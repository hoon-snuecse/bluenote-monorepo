import { NextResponse } from 'next/server';
// Removed next-auth import
import { checkAuth } from '@/lib/supabase-auth-helpers';

export async function GET() {
  try {
    const { error: authError } = await checkAuth('admin');
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: JWT 디코딩
    if (ANON_KEY) {
      try {
        // JWT 디코딩 (서명 검증 없이)
        const parts = ANON_KEY.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        results.anonKeyDecoded = {
          role: payload.role,
          iss: payload.iss,
          iat: payload.iat,
          exp: payload.exp
        };
      } catch (e) {
        results.anonKeyDecoded = { error: e.message };
      }
    }

    if (SERVICE_KEY) {
      try {
        const parts = SERVICE_KEY.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        results.serviceKeyDecoded = {
          role: payload.role,
          iss: payload.iss,
          iat: payload.iat,
          exp: payload.exp
        };
      } catch (e) {
        results.serviceKeyDecoded = { error: e.message };
      }
    }

    // Test 2: PostgREST 설정 확인
    if (SUPABASE_URL && ANON_KEY) {
      try {
        // OpenAPI spec 가져오기
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': ANON_KEY,
            'Accept': 'application/openapi+json'
          }
        });
        
        results.postgrestInfo = {
          status: response.status,
          contentType: response.headers.get('content-type')
        };
      } catch (error) {
        results.postgrestInfo = { error: error.message };
      }
    }

    // Test 3: RLS 상태 직접 확인
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const rlsCheckQuery = `
          SELECT 
            c.relname as table_name,
            c.relrowsecurity as rls_enabled,
            count(p.polname) as policy_count
          FROM pg_class c
          LEFT JOIN pg_policy p ON c.oid = p.polrelid
          WHERE c.relname IN ('user_permissions', 'usage_logs')
          GROUP BY c.relname, c.relrowsecurity
        `;
        
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/query_rls_status`,
          {
            method: 'POST',
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: rlsCheckQuery })
          }
        );

        if (response.ok) {
          results.rlsStatus = await response.json();
        }
      } catch (error) {
        // RPC function might not exist
      }
    }

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug RLS API Error', 
      message: error.message 
    }, { status: 500 });
  }
}