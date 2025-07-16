import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 과제 목록 조회
export async function GET() {
  try {
    // 환경 변수 확인
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not configured');
      return NextResponse.json(
        { success: false, error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const assignments = await prisma.assignment.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Prisma는 JSON 필드를 자동으로 파싱하므로 그대로 반환
    return NextResponse.json({ 
      success: true, 
      assignments: assignments
    });
  } catch (error) {
    console.error('과제 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새 과제 생성
export async function POST(request: NextRequest) {
  let data;
  
  try {
    data = await request.json();
    console.log('Creating assignment with data:', data);
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
  
  try {
    // 개발 환경에서는 인증 체크를 건너뛰고 기본 teacherId 사용
    const isDevelopment = process.env.NODE_ENV === 'development';
    let teacherId = 'default-teacher-id';
    
    if (!isDevelopment) {
      // 프로덕션에서는 인증 체크
      // TODO: JWT 토큰에서 teacherId 추출
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json(
          { success: false, error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }
    }
    
    // 필수 필드 검증
    if (!data.title || !data.schoolName || !data.gradeLevel || !data.writingType) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    console.log('Attempting to create assignment in database with teacherId:', teacherId);
    
    // 배열을 JSON으로 저장 (Prisma는 자동으로 처리)
    const assignment = await prisma.assignment.create({
      data: {
        title: data.title,
        schoolName: data.schoolName,
        gradeLevel: data.gradeLevel,
        writingType: data.writingType,
        evaluationDomains: data.evaluationDomains || [],
        evaluationLevels: data.evaluationLevels || [],
        levelCount: parseInt(data.levelCount || '4'),
        gradingCriteria: data.gradingCriteria || ''
      }
    });
    
    console.log('Assignment created successfully:', assignment.id);

    // 응답 시 JSON 필드는 이미 배열이므로 그대로 반환
    return NextResponse.json({ 
      success: true, 
      assignment: assignment,
      assignmentId: assignment.id 
    });
  } catch (error) {
    console.error('과제 생성 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '과제 생성 중 오류가 발생했습니다.';
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}