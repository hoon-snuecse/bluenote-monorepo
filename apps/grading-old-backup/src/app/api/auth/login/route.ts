import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // 입력값 검증
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }
    
    // 계정 활성화 확인
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: '비활성화된 계정입니다. 관리자에게 문의해주세요.' },
        { status: 403 }
      );
    }
    
    // 비밀번호 확인
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }
    
    // 마지막 로그인 시간 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    // JWT 토큰 생성
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase() as 'teacher' | 'admin'
    });
    
    // 응답 생성
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolName: user.schoolName
      }
    });
    
    // 쿠키에 토큰 설정
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7일
    });
    
    return response;
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { success: false, error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}