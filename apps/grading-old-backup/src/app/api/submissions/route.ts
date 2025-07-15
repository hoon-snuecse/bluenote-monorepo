import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 제출물 생성
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 과제 존재 여부 확인
    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 제출물 생성
    const submission = await prisma.submission.create({
      data: {
        assignmentId: data.assignmentId,
        studentName: data.studentName,
        studentId: data.studentId,
        content: data.content
      }
    });

    return NextResponse.json({ 
      success: true, 
      submission,
      submissionId: submission.id,
      message: '과제가 성공적으로 제출되었습니다.' 
    });
  } catch (error) {
    console.error('제출물 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '제출 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 제출물 목록 조회 (특정 과제)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assignmentId = searchParams.get('assignmentId');

    const where = assignmentId ? { assignmentId } : {};

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: {
        submittedAt: 'desc'
      },
      include: {
        evaluations: {
          select: {
            id: true,
            evaluatedAt: true
          }
        }
      }
    });

    // 평가 여부 추가
    const formattedSubmissions = submissions.map(submission => ({
      ...submission,
      status: submission.evaluations.length > 0 ? 'evaluated' : 'submitted',
      isEvaluated: submission.evaluations.length > 0
    }));

    return NextResponse.json({ 
      success: true, 
      submissions: formattedSubmissions 
    });
  } catch (error) {
    console.error('제출물 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '제출물 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}