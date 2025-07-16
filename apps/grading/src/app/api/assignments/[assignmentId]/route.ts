import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 개별 과제 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: params.assignmentId
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // JSON 필드가 제대로 파싱되었는지 확인하고 변환
    const parsedAssignment = {
      ...assignment,
      evaluationDomains: Array.isArray(assignment.evaluationDomains) 
        ? assignment.evaluationDomains 
        : JSON.parse(assignment.evaluationDomains as string),
      evaluationLevels: Array.isArray(assignment.evaluationLevels)
        ? assignment.evaluationLevels
        : JSON.parse(assignment.evaluationLevels as string),
      gradingCriteria: assignment.gradingCriteria // gradingCriteria 포함
    };

    return NextResponse.json({ 
      success: true, 
      assignment: parsedAssignment 
    });
  } catch (error) {
    console.error('과제 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 과제 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const data = await request.json();
    
    const assignment = await prisma.assignment.update({
      where: {
        id: params.assignmentId
      },
      data: {
        title: data.title,
        schoolName: data.schoolName,
        gradeLevel: data.gradeLevel,
        writingType: data.writingType,
        evaluationDomains: data.evaluationDomains,
        evaluationLevels: data.evaluationLevels,
        levelCount: parseInt(data.levelCount),
        gradingCriteria: data.gradingCriteria
      }
    });

    // JSON 필드가 제대로 파싱되었는지 확인하고 변환
    const parsedAssignment = {
      ...assignment,
      evaluationDomains: Array.isArray(assignment.evaluationDomains) 
        ? assignment.evaluationDomains 
        : JSON.parse(assignment.evaluationDomains as string),
      evaluationLevels: Array.isArray(assignment.evaluationLevels)
        ? assignment.evaluationLevels
        : JSON.parse(assignment.evaluationLevels as string),
      gradingCriteria: assignment.gradingCriteria // gradingCriteria 포함
    };

    return NextResponse.json({ 
      success: true, 
      assignment: parsedAssignment 
    });
  } catch (error) {
    console.error('과제 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 과제 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // 관련된 제출물과 평가도 함께 삭제됨 (onDelete: Cascade)
    await prisma.assignment.delete({
      where: {
        id: params.assignmentId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: '과제가 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('과제 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '과제 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}