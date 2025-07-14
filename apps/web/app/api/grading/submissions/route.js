import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const supabase = await createClient();
    
    // Prepare submission data
    const submissionData = {
      assignment_id: data.assignmentId,
      student_name: data.studentName,
      student_number: data.studentNumber,
      class_name: data.className,
      content: data.content,
      status: 'submitted'
    };

    // Insert into database
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert([submissionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      return NextResponse.json(
        { success: false, error: '제출 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        submittedAt: submission.submitted_at
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

    const supabase = await createClient();

    // Fetch submissions from database
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json(
        { success: false, error: '제출 목록을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // Transform data to match frontend format
    const transformedSubmissions = submissions?.map(submission => ({
      id: submission.id,
      assignmentId: submission.assignment_id,
      studentName: submission.student_name,
      studentNumber: submission.student_number,
      className: submission.class_name,
      content: submission.content,
      submittedAt: submission.submitted_at,
      status: submission.status
    })) || [];

    return NextResponse.json({
      success: true,
      submissions: transformedSubmissions
    });
    
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: '제출 목록을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}