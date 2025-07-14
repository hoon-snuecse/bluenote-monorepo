import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// 접근 토큰 생성
export async function POST(request: NextRequest) {
  try {
    const { evaluationId, studentId, expiresIn = 30 } = await request.json();
    
    // 평가 존재 여부 확인
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId }
    });

    if (!evaluation) {
      return NextResponse.json(
        { success: false, error: '평가를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 고유 토큰 생성
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn); // 기본 30일 유효
    
    // 토큰 정보 저장
    const accessToken = await prisma.accessToken.create({
      data: {
        token,
        evaluationId,
        studentId,
        expiresAt
      }
    });
    
    // 접근 URL 생성
    const accessUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/view/${token}`;
    
    return NextResponse.json({
      success: true,
      token,
      accessUrl,
      expiresAt: accessToken.expiresAt
    });
  } catch (error) {
    console.error('토큰 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '토큰 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 토큰 검증
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: '토큰이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }
    
    const accessToken = await prisma.accessToken.findUnique({
      where: { token }
    });
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 404 }
      );
    }
    
    // 만료 확인
    if (new Date(accessToken.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: '토큰이 만료되었습니다.' },
        { status: 401 }
      );
    }
    
    // 사용 표시 업데이트 (선택사항)
    if (!accessToken.used) {
      await prisma.accessToken.update({
        where: { id: accessToken.id },
        data: { used: true }
      });
    }
    
    return NextResponse.json({
      success: true,
      tokenData: {
        token: accessToken.token,
        evaluationId: accessToken.evaluationId,
        studentId: accessToken.studentId,
        expiresAt: accessToken.expiresAt
      }
    });
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return NextResponse.json(
      { success: false, error: '토큰 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}