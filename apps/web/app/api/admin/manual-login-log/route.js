import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    // 현재 사용자의 로그인 로그 수동 추가
    const { data, error } = await supabase
      .from('usage_logs')
      .insert({
        user_email: session.user.email,
        action_type: 'login'
      })
      .select();
    
    if (error) {
      console.error('Error inserting manual login log:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Manual login log created successfully' 
    });
  } catch (error) {
    console.error('Error in manual login log API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}