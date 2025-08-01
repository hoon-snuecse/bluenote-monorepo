import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const { id: assignmentId } = params;

    // 과제 소유권 확인
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (assignment.userId !== user.id && assignment.userEmail !== user.email) {
      return NextResponse.json(
        { error: '과제를 공유할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 이미 공유된 과제인지 확인
    if (assignment.isShared) {
      return NextResponse.json(
        { error: '이미 공유된 과제입니다.' },
        { status: 400 }
      );
    }

    // 과제 공유 처리
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        isShared: true,
        sharedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: '과제가 성공적으로 공유되었습니다.',
      assignment: {
        id: updatedAssignment.id,
        title: updatedAssignment.title,
        isShared: updatedAssignment.isShared,
        sharedAt: updatedAssignment.sharedAt,
      },
    });
  } catch (error) {
    console.error('과제 공유 오류:', error);
    return NextResponse.json(
      { error: '과제 공유 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 공유 취소
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const { id: assignmentId } = params;

    // 과제 소유권 확인
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (assignment.userId !== user.id && assignment.userEmail !== user.email) {
      return NextResponse.json(
        { error: '과제 공유를 취소할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 공유 취소 처리
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        isShared: false,
        sharedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: '과제 공유가 취소되었습니다.',
      assignment: {
        id: updatedAssignment.id,
        title: updatedAssignment.title,
        isShared: updatedAssignment.isShared,
      },
    });
  } catch (error) {
    console.error('과제 공유 취소 오류:', error);
    return NextResponse.json(
      { error: '과제 공유 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}