import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/database/supabase';

export async function POST(request) {
  try {
    const data = await request.json();
    const supabase = createServerSupabaseClient();
    
    // Check if submission already exists for this student
    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('assignment_id', data.assignmentId)
      .eq('student_name', data.studentName)
      .single();
    
    if (existing) {
      // Update existing submission
      const { data: submission, error } = await supabase
        .from('submissions')
        .update({
          content: data.content,
          submitted_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating submission:', error);
        return NextResponse.json(
          { success: false, error: '제출 업데이트 중 오류가 발생했습니다' },
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
    } else {
      // Create new submission
      const submissionData = {
        assignment_id: data.assignmentId,
        student_name: data.studentName,
        content: data.content,
        submitted_at: new Date().toISOString()
      };

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
    }
    
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

    const supabase = createServerSupabaseClient();

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
      content: submission.content,
      submittedAt: submission.submitted_at,
      evaluationStatus: submission.evaluation_status || 'pending',
      evaluationId: submission.evaluation_id
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