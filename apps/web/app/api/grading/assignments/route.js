import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Mock data for now
const mockAssignments = [
  {
    id: '1',
    title: '2024 1학기 논설문 쓰기',
    schoolName: '서울초등학교',
    gradeLevel: '6학년',
    writingType: '논설문',
    evaluationDomains: ['주장의 명확성', '근거의 타당성', '논리적 구조', '설득력'],
    evaluationLevels: ['매우 우수', '우수', '보통', '미흡'],
    levelCount: '4',
    gradingCriteria: '논설문 평가 기준',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '창의적 글쓰기 평가',
    schoolName: '서울초등학교',
    gradeLevel: '5학년',
    writingType: '창작문',
    evaluationDomains: ['창의성', '표현력', '구성력', '맞춤법'],
    evaluationLevels: ['매우 우수', '우수', '보통', '미흡'],
    levelCount: '4',
    gradingCriteria: '창작문 평가 기준',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Return mock data for now
    return NextResponse.json({
      success: true,
      assignments: mockAssignments
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

    const data = await request.json();
    
    // Mock create - just return the data with an ID
    const newAssignment = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      assignment: newAssignment
    });
    
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: '과제 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}