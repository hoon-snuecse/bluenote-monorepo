import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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
        contentLength: s.content?.length || 0
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
        evaluatedAt: sub.evaluatedAt || null,
        evaluation: sub.evaluation || null,
        status: sub.evaluatedAt ? 'evaluated' : 'submitted',
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
    
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('[Submissions API] Unauthorized - no session');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      studentName,
      studentId,
      studentDbId,
      content = '',
      schoolName,
      gradeLevel,
      className
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
          submittedAt: new Date(),
          status: 'submitted'
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
          submittedAt: new Date(),
          status: 'submitted'
        }
      });
    }

    console.log('[Submissions API] Created submission:', {
      id: submission.id,
      studentName: submission.studentName,
      studentId: submission.studentId,
      assignmentId: submission.assignmentId
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
        status: submission.status
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