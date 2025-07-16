import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookie, verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 토큰 가져오기
    const token = getTokenFromCookie(request.headers.get('cookie'));
    
    // 개발 모드에서 dev-token 처리
    if (process.env.NODE_ENV === 'development' && token === 'dev-token') {
      const mockUser = {
        id: 'dev-user-1',
        email: 'teacher@bluenote.site',
        name: '개발 선생님',
        role: 'TEACHER',
        schoolName: '블루노트초등학교',
        isActive: true,
        lastLoginAt: new Date()
      };
      
      return NextResponse.json({
        success: true,
        user: mockUser
      });
    }
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 토큰 검증
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolName: true,
        isActive: true,
        lastLoginAt: true
      }
    });
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}