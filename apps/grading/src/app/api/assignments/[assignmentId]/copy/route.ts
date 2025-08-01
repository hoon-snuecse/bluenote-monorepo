import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // 인증 체크
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: '사용자 이메일을 찾을 수 없습니다.' },
        { status: 403 }
      );
    }
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
        schoolName: originalAssignment.schoolName,
        gradeLevel: originalAssignment.gradeLevel,
        writingType: originalAssignment.writingType,
        evaluationDomains: originalAssignment.evaluationDomains,
        evaluationLevels: originalAssignment.evaluationLevels,
        levelCount: originalAssignment.levelCount,
        gradingCriteria: originalAssignment.gradingCriteria,
        userId: null, // 새로 복사하는 사용자는 User 테이블에 없을 수도 있음
        userEmail: userEmail,
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
  }
}