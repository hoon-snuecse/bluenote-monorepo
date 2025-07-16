import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 과제 목록 조회
export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // JSON 문자열을 배열로 변환
    const formattedAssignments = assignments.map(assignment => ({
      ...assignment,
      evaluationDomains: JSON.parse(assignment.evaluationDomains),
      evaluationLevels: JSON.parse(assignment.evaluationLevels),
    }));

    return NextResponse.json({ 
      success: true, 
      assignments: formattedAssignments 
    });
  } catch (error) {
    console.error('과제 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새 과제 생성
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Creating assignment with data:', data);
    
    // 필수 필드 검증
    if (!data.title || !data.schoolName || !data.gradeLevel || !data.writingType) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // 배열을 JSON 문자열로 변환
    const assignment = await prisma.assignment.create({
      data: {
        title: data.title,
        schoolName: data.schoolName,
        gradeLevel: data.gradeLevel,
        writingType: data.writingType,
        evaluationDomains: JSON.stringify(data.evaluationDomains || []),
        evaluationLevels: JSON.stringify(data.evaluationLevels || []),
        levelCount: parseInt(data.levelCount || '4'),
        gradingCriteria: data.gradingCriteria || ''
      }
    });

    // 응답 시 다시 배열로 변환
    const formattedAssignment = {
      ...assignment,
      evaluationDomains: JSON.parse(assignment.evaluationDomains),
      evaluationLevels: JSON.parse(assignment.evaluationLevels),
    };

    return NextResponse.json({ 
      success: true, 
      assignment: formattedAssignment,
      assignmentId: assignment.id 
    });
  } catch (error) {
    console.error('과제 생성 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '과제 생성 중 오류가 발생했습니다.';
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}