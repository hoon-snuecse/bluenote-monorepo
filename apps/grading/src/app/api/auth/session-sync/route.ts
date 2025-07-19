import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createAuthOptions } from '@bluenote/auth';

export async function GET() {
  // web 앱에서 세션을 가져와서 grading 앱에 동기화
  const session = await getServerSession(createAuthOptions());
  
  if (!session) {
    return NextResponse.json({ error: 'No session found' }, { status: 401 });
  }
  
  // 세션 정보 반환
  return NextResponse.json({
    user: session.user,
    expires: session.expires
  });
}