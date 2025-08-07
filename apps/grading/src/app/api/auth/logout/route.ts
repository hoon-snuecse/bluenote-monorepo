import { NextResponse } from 'next/server';
import { createServerClient } from '@bluenote/supabase-auth/server';

export async function POST() {
  try {
    const supabase = await createServerClient();
    
    // Supabase 로그아웃
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // 응답 생성
    const response = NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
    
    // Supabase 관련 쿠키 삭제
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    
    return response;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return NextResponse.json(
      { success: false, error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}