import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionWithPermissions } from '@/lib/auth-helpers';
import { checkAssignmentPermission } from '@/lib/assignment-auth';

// 개별 과제 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // 인증 체크
    const session = await getSessionWithPermissions();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 권한 확인
    const permission = await checkAssignmentPermission(params.assignmentId, session.user?.email);
    if (!permission.canView) {
      return NextResponse.json(
        { success: false, error: '이 과제를 볼 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: params.assignmentId
      },
      include: {
        _count: {
          select: {
            submissions: true
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
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
      // 권한 정보 추가
      permission: permission,
      submissionCount: assignment._count?.submissions || 0
    };

    return NextResponse.json({ 
      success: true, 
      assignment: parsedAssignment 
    });
  } catch (error) {
    console.error('과제 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 과제 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // 인증 체크
    const session = await getSessionWithPermissions();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 권한 확인
    const permission = await checkAssignmentPermission(params.assignmentId, session.user?.email);
    if (!permission.canEdit) {
      return NextResponse.json(
        { success: false, error: '이 과제를 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    const assignment = await prisma.assignment.update({
      where: {
        id: params.assignmentId
      },
      data: {
        title: data.title,
        schoolName: data.schoolName,
        gradeLevel: data.gradeLevel,
        writingType: data.writingType,
        evaluationDomains: data.evaluationDomains,
        evaluationLevels: data.evaluationLevels,
        levelCount: parseInt(data.levelCount),
        gradingCriteria: data.gradingCriteria
      }
    });

    // JSON 필드가 제대로 파싱되었는지 확인하고 변환
    const parsedAssignment = {
      ...assignment,
      evaluationDomains: Array.isArray(assignment.evaluationDomains) 
        ? assignment.evaluationDomains 
        : JSON.parse(assignment.evaluationDomains as string),
      evaluationLevels: Array.isArray(assignment.evaluationLevels)
        ? assignment.evaluationLevels
        : JSON.parse(assignment.evaluationLevels as string),
      gradingCriteria: assignment.gradingCriteria // gradingCriteria 포함
    };

    return NextResponse.json({ 
      success: true, 
      assignment: parsedAssignment 
    });
  } catch (error) {
    console.error('과제 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 과제 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // 인증 체크
    const session = await getSessionWithPermissions();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 권한 확인
    const permission = await checkAssignmentPermission(params.assignmentId, session.user?.email);
    if (!permission.canDelete) {
      return NextResponse.json(
        { success: false, error: '이 과제를 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }
    // 관련된 제출물과 평가도 함께 삭제됨 (onDelete: Cascade)
    await prisma.assignment.delete({
      where: {
        id: params.assignmentId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: '과제가 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('과제 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}