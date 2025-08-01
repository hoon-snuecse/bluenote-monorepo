import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 공유된 과제의 미리보기 (인증 불필요)
export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: params.assignmentId
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 공유되지 않은 과제는 접근 불가
    if (!assignment.isShared && !assignment.isSample) {
      return NextResponse.json(
        { success: false, error: '이 과제는 공유되지 않은 과제입니다.' },
        { status: 403 }
      );
    }

    // JSON 필드가 제대로 파싱되었는지 확인하고 변환
    const parsedAssignment = {
      ...assignment,
      evaluationDomains: Array.isArray(assignment.evaluationDomains) 
        ? assignment.evaluationDomains 
        : JSON.parse(assignment.evaluationDomains as string),
      evaluationLevels: Array.isArray(assignment.evaluationLevels)
        ? assignment.evaluationLevels
        : JSON.parse(assignment.evaluationLevels as string),
      gradingCriteria: assignment.gradingCriteria,
      // 민감한 정보 제외
      userId: undefined,
      submissions: undefined
    };

    return NextResponse.json({ 
      success: true, 
      assignment: parsedAssignment 
    });
  } catch (error) {
    console.error('과제 미리보기 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}