import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { checkAssignmentPermission } from '@/lib/assignment-auth';

// 과제 공유 상태 토글
export async function PUT(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // 인증 확인
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 권한 확인 (소유자만 공유 설정 가능)
    const permission = await checkAssignmentPermission(params.assignmentId, session.user?.email);
    if (!permission.canShare) {
      return NextResponse.json(
        { success: false, error: '이 과제를 공유할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { isShared } = await request.json();

    // 과제 공유 상태 업데이트
    const assignment = await prisma.assignment.update({
      where: { id: params.assignmentId },
      data: {
        isShared: isShared,
        sharedAt: isShared ? new Date() : null
      }
    });

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        isShared: assignment.isShared,
        sharedAt: assignment.sharedAt
      }
    });
  } catch (error) {
    console.error('과제 공유 설정 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 공유 설정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 과제 공유 사용자 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // 인증 확인
    const session = await getServerSession();
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

    // 공유된 사용자 목록 조회
    const sharedAssignments = await prisma.sharedAssignment.findMany({
      where: { assignmentId: params.assignmentId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      sharedUsers: sharedAssignments.map(sa => ({
        id: sa.id,
        email: sa.sharedToEmail,
        permission: sa.permission,
        sharedByEmail: sa.sharedByEmail,
        createdAt: sa.createdAt
      }))
    });
  } catch (error) {
    console.error('공유 사용자 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '공유 사용자 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 사용자에게 과제 공유
export async function POST(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // 인증 확인
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 권한 확인 (소유자만 공유 가능)
    const permission = await checkAssignmentPermission(params.assignmentId, session.user.email);
    if (!permission.canShare) {
      return NextResponse.json(
        { success: false, error: '이 과제를 공유할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { email, permission: sharePermission } = await request.json();

    if (!email || !sharePermission) {
      return NextResponse.json(
        { success: false, error: '이메일과 권한 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 자기 자신에게 공유 방지
    if (email === session.user.email) {
      return NextResponse.json(
        { success: false, error: '자기 자신에게는 공유할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 중복 공유 확인
    const existingShare = await prisma.sharedAssignment.findUnique({
      where: {
        assignmentId_sharedToEmail: {
          assignmentId: params.assignmentId,
          sharedToEmail: email
        }
      }
    });

    if (existingShare) {
      // 기존 공유가 있으면 권한만 업데이트
      const updated = await prisma.sharedAssignment.update({
        where: { id: existingShare.id },
        data: { permission: sharePermission }
      });

      return NextResponse.json({
        success: true,
        message: '공유 권한이 업데이트되었습니다.',
        sharedAssignment: {
          id: updated.id,
          email: updated.sharedToEmail,
          permission: updated.permission
        }
      });
    }

    // 새로운 공유 생성
    const sharedAssignment = await prisma.sharedAssignment.create({
      data: {
        assignmentId: params.assignmentId,
        sharedToEmail: email,
        sharedByEmail: session.user.email,
        permission: sharePermission
      }
    });

    // 과제를 공유 상태로 업데이트 (처음 공유하는 경우)
    await prisma.assignment.update({
      where: { id: params.assignmentId },
      data: { 
        isShared: true,
        sharedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: '과제가 성공적으로 공유되었습니다.',
      sharedAssignment: {
        id: sharedAssignment.id,
        email: sharedAssignment.sharedToEmail,
        permission: sharedAssignment.permission
      }
    });
  } catch (error) {
    console.error('과제 공유 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 공유 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 공유 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // 인증 확인
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: '이메일 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 권한 확인 (소유자만 공유 취소 가능)
    const permission = await checkAssignmentPermission(params.assignmentId, session.user.email);
    if (!permission.canShare) {
      return NextResponse.json(
        { success: false, error: '이 과제의 공유를 취소할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 공유 삭제
    await prisma.sharedAssignment.delete({
      where: {
        assignmentId_sharedToEmail: {
          assignmentId: params.assignmentId,
          sharedToEmail: email
        }
      }
    });

    // 다른 공유가 남아있는지 확인
    const remainingShares = await prisma.sharedAssignment.count({
      where: { assignmentId: params.assignmentId }
    });

    // 공유가 하나도 없으면 isShared를 false로 업데이트
    if (remainingShares === 0) {
      await prisma.assignment.update({
        where: { id: params.assignmentId },
        data: { 
          isShared: false,
          sharedAt: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: '공유가 취소되었습니다.'
    });
  } catch (error) {
    console.error('공유 취소 오류:', error);
    return NextResponse.json(
      { success: false, error: '공유 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}