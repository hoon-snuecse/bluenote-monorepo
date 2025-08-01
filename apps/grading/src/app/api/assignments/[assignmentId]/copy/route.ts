import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const authResult = await authMiddleware(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const { assignmentId } = params;

    // 원본 과제 조회
    const originalAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!originalAssignment) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 공유된 과제인지 확인
    if (!originalAssignment.isShared && !originalAssignment.isSample) {
      return NextResponse.json(
        { error: '공유되지 않은 과제는 복사할 수 없습니다.' },
        { status: 403 }
      );
    }

    // 새로운 과제 생성 (학생 데이터 제외)
    const copiedAssignment = await prisma.assignment.create({
      data: {
        title: `${originalAssignment.title} (복사본)`,
        schoolName: user.schoolName || originalAssignment.schoolName,
        gradeLevel: originalAssignment.gradeLevel,
        writingType: originalAssignment.writingType,
        evaluationDomains: originalAssignment.evaluationDomains,
        evaluationLevels: originalAssignment.evaluationLevels,
        levelCount: originalAssignment.levelCount,
        gradingCriteria: originalAssignment.gradingCriteria,
        userId: user.id,
        userEmail: user.email,
        isShared: false, // 복사본은 기본적으로 비공개
        isSample: false, // 복사본은 샘플이 아님
      },
    });

    // TODO: 향후 복사 통계 업데이트 로직 추가
    // await updateCopyCount(assignmentId);

    return NextResponse.json({
      success: true,
      message: '과제가 성공적으로 복사되었습니다.',
      assignment: {
        id: copiedAssignment.id,
        title: copiedAssignment.title,
      },
    });
  } catch (error) {
    console.error('과제 복사 오류:', error);
    return NextResponse.json(
      { error: '과제 복사 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}