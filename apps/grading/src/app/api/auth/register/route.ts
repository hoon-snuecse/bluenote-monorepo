import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, schoolName } = await request.json();
    
    // 입력값 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      );
    }
    
    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);
    
    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        schoolName,
        role: 'TEACHER'
      }
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
    console.error('회원가입 오류:', error);
    return NextResponse.json(
      { success: false, error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}