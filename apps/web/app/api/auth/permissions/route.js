import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@bluenote/supabase-auth/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // 1. 현재 사용자 확인
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    // 2. ADMIN_EMAILS 체크 (폴백)
    const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
    const isAdminEmail = adminEmails.includes(user.email);
    
    // 3. Service Role 클라이언트로 권한 정보 조회 (RLS 우회)
    let permissions = null;
    try {
      const adminSupabase = createAdminClient();
      const { data, error: permError } = await adminSupabase
        .from('user_permissions')
        .select('role, can_write, claude_daily_limit')
        .eq('email', user.email)
        .single();
      
      if (!permError && data) {
        permissions = data;
      }
    } catch (dbError) {
      console.log('[/api/auth/permissions] DB query failed, using fallback:', dbError.message);
    }
    
    // 4. 권한 정보가 없으면 폴백 사용
    if (!permissions && isAdminEmail) {
      permissions = {
        role: 'admin',
        can_write: true,
        claude_daily_limit: 1000
      };
    }
    
    // 5. 권한이 포함된 사용자 정보 반환
    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        isAdmin: permissions?.role === 'admin' || isAdminEmail,
        canWrite: permissions?.can_write || permissions?.role === 'admin' || isAdminEmail,
        permissions
      }
    });
    
  } catch (error) {
    console.error('[/api/auth/permissions] Error:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}