import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Service Role Key 테스트
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        hasUrl: !!SUPABASE_URL,
        hasServiceKey: !!SERVICE_KEY,
        hasAnonKey: !!ANON_KEY,
        serviceKeyPrefix: SERVICE_KEY ? SERVICE_KEY.substring(0, 10) + '...' : 'missing',
        serviceKeyLength: SERVICE_KEY?.length || 0
      },
      tests: {}
    };

    // Test 1: Service Role Key로 user_permissions 접근
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/user_permissions?select=*&limit=1`,
          {
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            }
          }
        );

        results.tests.serviceRoleAccess = {
          status: response.status,
          statusText: response.statusText,
          success: response.ok
        };

        if (!response.ok) {
          const errorText = await response.text();
          results.tests.serviceRoleAccess.error = errorText;
        } else {
          const data = await response.json();
          results.tests.serviceRoleAccess.dataReceived = data.length > 0;
        }
      } catch (error) {
        results.tests.serviceRoleAccess = { 
          error: error.message,
          success: false 
        };
      }
    }

    // Test 2: Anon Key로 접근 (실패해야 정상)
    if (SUPABASE_URL && ANON_KEY) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/user_permissions?select=*&limit=1`,
          {
            headers: {
              'apikey': ANON_KEY,
              'Authorization': `Bearer ${ANON_KEY}`
            }
          }
        );

        results.tests.anonKeyAccess = {
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          shouldFail: true,
          correctBehavior: !response.ok
        };
      } catch (error) {
        results.tests.anonKeyAccess = { 
          error: error.message,
          correctBehavior: true 
        };
      }
    }

    // Test 3: RLS 정책 확인
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/check_rls_status`,
          {
            method: 'POST',
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          }
        );

        if (response.ok) {
          const data = await response.json();
          results.tests.rlsStatus = data;
        }
      } catch (error) {
        // RPC 함수가 없을 수 있음 - 무시
      }
    }

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test Service Role API Error', 
      message: error.message 
    }, { status: 500 });
  }
}