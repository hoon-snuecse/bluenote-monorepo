import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
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
    
    // Get user from Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자 정보를 찾을 수 없습니다' },
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
      created_by: user.id
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
        { success: false, error: '과제 생성 중 오류가 발생했습니다' },
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