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
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: '제출물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // assignment의 JSON 필드 파싱
    if (submission.assignment) {
      submission.assignment.evaluationDomains = JSON.parse(submission.assignment.evaluationDomains);
      submission.assignment.evaluationLevels = JSON.parse(submission.assignment.evaluationLevels);
    }

    return NextResponse.json({ 
      success: true, 
      submission 
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