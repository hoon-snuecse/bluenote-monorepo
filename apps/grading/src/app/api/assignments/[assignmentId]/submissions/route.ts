import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    console.log('[Submissions API] GET request for assignmentId:', params.assignmentId);
    
    // First check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.assignmentId }
    });
    
    console.log('[Submissions API] Assignment found:', !!assignment);
    if (!assignment) {
      return NextResponse.json({
        success: false,
        error: 'Assignment not found',
        submissions: []
      });
    }
    
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: params.assignmentId,
      },
      include: {
        evaluations: {
          select: {
            id: true,
            evaluatedAt: true
          },
          orderBy: {
            evaluatedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('[Submissions API] Query result:', {
      totalFound: submissions.length,
      assignmentId: params.assignmentId,
      submissions: submissions.map(s => ({
        id: s.id,
        studentName: s.studentName,
        studentId: s.studentId,
        createdAt: s.createdAt,
        hasContent: !!s.content,
        contentLength: s.content?.length || 0,
        hasEvaluation: s.evaluations.length > 0
      }))
    });

    return NextResponse.json({
      success: true,
      submissions: submissions.map(sub => ({
        id: sub.id || '',
        studentId: sub.studentId || '',
        studentName: sub.studentName || '이름 없음',
        studentDbId: sub.studentDbId || null,
        content: sub.content || null,
        submittedAt: sub.createdAt || null,
        evaluatedAt: sub.evaluations[0]?.evaluatedAt || null,
        evaluation: sub.evaluation || null,
        status: sub.evaluations.length > 0 ? 'evaluated' : 'submitted',
        documentPath: (sub as any).documentPath || null,
        sourceType: (sub as any).sourceType || 'MANUAL',
        student: null // 학생 그룹과 연결되지 않은 제출물
      }))
    });
  } catch (error) {
    console.error('[Submissions API] Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    console.log('[Submissions API] POST request for assignmentId:', params.assignmentId);
    
    // 인증 확인 - 임시로 주석 처리
    // const session = await getServerSession();
    // console.log('[Submissions API] Session:', session ? 'exists' : 'null');
    // console.log('[Submissions API] User ID:', session?.user?.id || 'none');
    
    // if (!session?.user?.id) {
    //   console.log('[Submissions API] Unauthorized - no session or user ID');
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized - Please login' },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const {
      studentName,
      studentId,
      studentDbId,
      content = '',
      documentPath,
      sourceType = 'MANUAL'
    } = body;

    // 필수 필드 검증
    if (!studentName || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Student name and ID are required' },
        { status: 400 }
      );
    }

    // Assignment 존재 확인
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.assignmentId }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // 중복 제출 확인 및 업데이트/생성
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: params.assignmentId,
        studentId: studentId
      }
    });

    let submission;
    
    if (existingSubmission) {
      // 기존 제출물이 있으면 업데이트 (내용이 비어있는 경우만)
      if (existingSubmission.content && existingSubmission.content.trim() !== '') {
        return NextResponse.json(
          { success: false, error: 'Submission with content already exists for this student' },
          { status: 409 }
        );
      }
      
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          studentName,
          studentDbId,
          documentPath: documentPath || null,
          sourceType: sourceType || 'MANUAL',
          submittedAt: new Date()
        }
      });
    } else {
      // 새로운 제출물 생성
      submission = await prisma.submission.create({
        data: {
          assignmentId: params.assignmentId,
          studentName,
          studentId,
          studentDbId,
          content,
          documentPath: documentPath || null,
          sourceType: sourceType || 'MANUAL',
          submittedAt: new Date()
        }
      });
    }

    console.log('[Submissions API] Created submission:', {
      id: submission.id,
      studentName: submission.studentName,
      studentId: submission.studentId,
      assignmentId: submission.assignmentId
    });

    // Check if submission has evaluations
    const submissionWithEvaluations = await prisma.submission.findUnique({
      where: { id: submission.id },
      include: {
        evaluations: {
          select: { id: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        studentId: submission.studentId,
        studentName: submission.studentName,
        studentDbId: submission.studentDbId,
        content: submission.content,
        submittedAt: submission.submittedAt,
        status: submissionWithEvaluations?.evaluations.length ? 'evaluated' : 'submitted'
      }
    });
  } catch (error) {
    console.error('[Submissions API] Error creating submission:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create submission', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    console.log('[Submissions API] DELETE request for assignmentId:', params.assignmentId);
    
    const body = await request.json();
    const { submissionIds } = body;

    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No submission IDs provided' },
        { status: 400 }
      );
    }

    // 삭제할 submission들이 해당 assignment에 속하는지 확인
    const submissionsToDelete = await prisma.submission.findMany({
      where: {
        id: { in: submissionIds },
        assignmentId: params.assignmentId
      }
    });

    if (submissionsToDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid submissions found to delete' },
        { status: 404 }
      );
    }

    // 삭제 실행
    const deleteResult = await prisma.submission.deleteMany({
      where: {
        id: { in: submissionIds },
        assignmentId: params.assignmentId
      }
    });

    console.log('[Submissions API] Deleted submissions:', {
      requestedCount: submissionIds.length,
      deletedCount: deleteResult.count,
      assignmentId: params.assignmentId
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `${deleteResult.count}개의 제출물이 삭제되었습니다.`
    });
  } catch (error) {
    console.error('[Submissions API] Error deleting submissions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete submissions', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}