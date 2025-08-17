import { NextResponse } from 'next/server';
// Removed next-auth import
import { checkAuth } from '@/lib/supabase-auth-helpers';

export async function GET() {
  try {
    const { error: authError } = await checkAuth('admin');
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    // 간단한 테스트 응답
    const response = {
      test: true,
      timestamp: new Date().toISOString(),
      user: session.user.email
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}