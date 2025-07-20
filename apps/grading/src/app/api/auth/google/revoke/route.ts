import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase';

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createClient();
    
    // Delete user's Google tokens
    const { error } = await supabase
      .from('google_tokens')
      .delete()
      .eq('user_email', session.user.email);

    if (error) {
      console.error('Failed to delete tokens:', error);
      return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revoke error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}