import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 인증 체크
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // "설명하는 글쓰기" 과제 찾기
    const assignment = await prisma.assignment.findFirst({
      where: {
        title: {
          contains: '설명하는 글쓰기'
        }
      },
      include: {
        sharedAssignments: true
      }
    });

    if (!assignment) {
      return NextResponse.json({
        error: '설명하는 글쓰기 과제를 찾을 수 없습니다.'
      });
    }

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        isShared: assignment.isShared,
        sharedAt: assignment.sharedAt,
        userEmail: assignment.userEmail,
        sharedAssignments: assignment.sharedAssignments.map(sa => ({
          id: sa.id,
          sharedByEmail: sa.sharedByEmail,
          sharedToEmail: sa.sharedToEmail,
          permission: sa.permission,
          sharedAt: sa.sharedAt
        }))
      }
    });
  } catch (error) {
    console.error('공유 상태 조회 오류:', error);
    return NextResponse.json(
      { error: '공유 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}