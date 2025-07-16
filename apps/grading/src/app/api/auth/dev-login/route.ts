import { NextResponse } from 'next/server';

// Development-only auto-login endpoint
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is only available in development' },
      { status: 404 }
    );
  }

  // Mock user for development
  const mockUser = {
    id: 'dev-user-1',
    email: 'teacher@bluenote.site',
    name: '개발 선생님',
    role: 'TEACHER',
    schoolName: '블루노트초등학교',
    isActive: true,
    lastLoginAt: new Date().toISOString()
  };

  // Set a simple dev token cookie
  const response = NextResponse.json({
    success: true,
    user: mockUser,
    message: '개발 모드 자동 로그인'
  });

  response.cookies.set('auth-token', 'dev-token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return response;
}