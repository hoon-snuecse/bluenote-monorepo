import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    console.log('[Public Assignment API] GET request for assignmentId:', params.assignmentId);
    
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: params.assignmentId
      },
      select: {
        id: true,
        title: true,
        schoolName: true,
        gradeLevel: true,
        writingType: true,
        evaluationDomains: true,
        evaluationLevels: true,
        levelCount: true,
        gradingCriteria: true,
        createdAt: true
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const parsedAssignment = {
      ...assignment,
      evaluationDomains: Array.isArray(assignment.evaluationDomains) 
        ? assignment.evaluationDomains 
        : JSON.parse(assignment.evaluationDomains as string),
      evaluationLevels: Array.isArray(assignment.evaluationLevels)
        ? assignment.evaluationLevels
        : JSON.parse(assignment.evaluationLevels as string)
    };

    console.log('[Public Assignment API] Returning assignment data for:', assignment.title);

    return NextResponse.json({ 
      success: true, 
      assignment: parsedAssignment 
    });
  } catch (error) {
    console.error('[Public Assignment API] Error fetching assignment:', error);
    return NextResponse.json(
      { success: false, error: '과제 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}