import { NextResponse } from 'next/server';

// Mock submissions storage
const submissions = [];

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Create submission
    const submission = {
      id: String(Date.now()),
      assignmentId: data.assignmentId,
      studentName: data.studentName,
      studentNumber: data.studentNumber,
      className: data.className,
      content: data.content,
      submittedAt: new Date().toISOString(),
      status: 'submitted', // submitted, evaluated
      evaluation: null
    };

    // In real app, save to database
    submissions.push(submission);

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        submittedAt: submission.submittedAt
      }
    });
    
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { success: false, error: '제출 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// Get submissions for an assignment (protected)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    
    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: '과제 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // Filter submissions by assignment
    const assignmentSubmissions = submissions.filter(
      sub => sub.assignmentId === assignmentId
    );

    return NextResponse.json({
      success: true,
      submissions: assignmentSubmissions
    });
    
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: '제출 목록을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}