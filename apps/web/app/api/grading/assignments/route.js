import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    
    // Fetch assignments from database
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      return NextResponse.json(
        { success: false, error: '과제 목록을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // Transform data to match frontend format
    const transformedAssignments = assignments?.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      schoolName: assignment.school_name,
      gradeLevel: assignment.grade_level,
      writingType: assignment.writing_type,
      evaluationDomains: assignment.evaluation_domains,
      evaluationLevels: assignment.evaluation_levels,
      levelCount: assignment.level_count,
      gradingCriteria: assignment.grading_criteria,
      createdAt: assignment.created_at
    })) || [];

    return NextResponse.json({
      success: true,
      assignments: transformedAssignments
    });
    
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: '과제 목록을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    
    // NextAuth session을 사용하므로 user ID는 session에서 가져옴
    // Supabase auth가 아닌 NextAuth를 사용 중
    const userEmail = session.user?.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: '사용자 이메일을 찾을 수 없습니다' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Prepare data for Supabase (snake_case)
    const assignmentData = {
      title: data.title,
      school_name: data.schoolName,
      grade_level: data.gradeLevel,
      writing_type: data.writingType,
      evaluation_domains: data.evaluationDomains,
      evaluation_levels: data.evaluationLevels,
      level_count: data.levelCount,
      grading_criteria: data.gradingCriteria,
      // created_by 필드를 임시로 제외 (테이블에서 nullable로 변경 필요)
    };

    // Insert into database
    const { data: newAssignment, error } = await supabase
      .from('assignments')
      .insert([assignmentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: '과제 생성 중 오류가 발생했습니다',
          details: error.message,
          hint: error.hint || 'Supabase 테이블이 생성되었는지 확인하세요'
        },
        { status: 500 }
      );
    }

    // Transform response to match frontend format
    const transformedAssignment = {
      id: newAssignment.id,
      title: newAssignment.title,
      schoolName: newAssignment.school_name,
      gradeLevel: newAssignment.grade_level,
      writingType: newAssignment.writing_type,
      evaluationDomains: newAssignment.evaluation_domains,
      evaluationLevels: newAssignment.evaluation_levels,
      levelCount: newAssignment.level_count,
      gradingCriteria: newAssignment.grading_criteria,
      createdAt: newAssignment.created_at
    };

    return NextResponse.json({
      success: true,
      assignment: transformedAssignment
    });
    
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: '과제 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}