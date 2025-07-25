import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    // claude_chat 타입으로 테스트
    const { data: claudeData, error: claudeError } = await supabase
      .from('usage_logs')
      .insert({
        user_email: session.user.email,
        action_type: 'claude_chat'
      })
      .select();
    
    // post_write 타입으로 테스트  
    const { data: postData, error: postError } = await supabase
      .from('usage_logs')
      .insert({
        user_email: session.user.email,
        action_type: 'post_write'
      })
      .select();

    return NextResponse.json({ 
      success: true,
      results: {
        claude_chat: claudeError ? claudeError.message : 'Success',
        post_write: postError ? postError.message : 'Success',
        data: { claudeData, postData }
      }
    });
  } catch (error) {
    console.error('Error in test action types API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}