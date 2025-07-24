import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

// 과제 목록 조회
export async function GET() {
  try {
    // 인증 체크
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

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

    // JSON 필드가 제대로 파싱되었는지 확인하고 변환
    const parsedAssignments = assignments.map(assignment => ({
      ...assignment,
      evaluationDomains: Array.isArray(assignment.evaluationDomains) 
        ? assignment.evaluationDomains 
        : JSON.parse(assignment.evaluationDomains as string),
      evaluationLevels: Array.isArray(assignment.evaluationLevels)
        ? assignment.evaluationLevels
        : JSON.parse(assignment.evaluationLevels as string),
      gradingCriteria: assignment.gradingCriteria // gradingCriteria 포함
    }));

    return NextResponse.json({ 
      success: true, 
      assignments: parsedAssignments
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
    // 인증 체크
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const teacherId = session.user.email || 'default-teacher-id';
    
    // 필수 필드 검증
    if (!data.title || !data.schoolName || !data.gradeLevel || !data.writingType) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    console.log('Attempting to create assignment in database');
    console.log('Data to save:', {
      title: data.title,
      schoolName: data.schoolName,
      gradeLevel: data.gradeLevel,
      writingType: data.writingType,
      evaluationDomains: data.evaluationDomains || [],
      evaluationLevels: data.evaluationLevels || [],
      levelCount: data.levelCount,
      gradingCriteria: data.gradingCriteria || ''
    });
    
    // 과제 생성 (트랜잭션 대신 직접 생성)
    let assignment;
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        // Disconnect and reconnect to get a fresh connection
        if (retries < 3) {
          await prisma.$disconnect();
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        }
        
        assignment = await prisma.assignment.create({
          data: {
            title: data.title,
            schoolName: data.schoolName,
            gradeLevel: data.gradeLevel,
            writingType: data.writingType,
            evaluationDomains: data.evaluationDomains || [],
            evaluationLevels: data.evaluationLevels || [],
            levelCount: typeof data.levelCount === 'string' ? parseInt(data.levelCount) : (data.levelCount || 4),
            gradingCriteria: data.gradingCriteria || ''
          }
        });
        
        // If successful, break the loop
        break;
      } catch (error) {
        lastError = error;
        retries--;
        console.error(`Assignment creation attempt failed (${3 - retries}/3):`, error);
        
        if (retries === 0) {
          throw error;
        }
      }
    }
    
    
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
    
    // Prisma 관련 에러 상세 정보
    let errorDetails = 'Unknown error';
    if (error instanceof Error) {
      errorDetails = error.toString();
      // Prisma 에러인 경우 더 자세한 정보 제공
      if (error.message.includes('P2002')) {
        errorDetails = '중복된 데이터가 있습니다.';
      } else if (error.message.includes('P2025')) {
        errorDetails = '관련 레코드를 찾을 수 없습니다.';
      } else if (error.message.includes('connect')) {
        errorDetails = '데이터베이스 연결 오류입니다. DATABASE_URL을 확인하세요.';
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails,
        env: process.env.NODE_ENV
      },
      { status: 500 }
    );
  }
}