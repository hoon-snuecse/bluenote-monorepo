import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 개별 제출물 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const submission = await prisma.submission.findUnique({
      where: {
        id: params.submissionId
      },
      include: {
        assignment: true,
        evaluations: {
          select: {
            id: true,
            evaluatedAt: true,
            overallLevel: true
          },
          orderBy: {
            evaluatedAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: '제출물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Prisma는 JSON 필드를 자동으로 파싱하므로 추가 처리 불필요

    // 평가 정보 추가
    const evaluatedAt = submission.evaluations?.[0]?.evaluatedAt || null;

    return NextResponse.json({ 
      success: true, 
      submission: {
        ...submission,
        evaluatedAt
      }
    });
  } catch (error) {
    console.error('제출물 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '제출물 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 제출물 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    await prisma.submission.delete({
      where: {
        id: params.submissionId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: '제출물이 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('제출물 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '제출물 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}