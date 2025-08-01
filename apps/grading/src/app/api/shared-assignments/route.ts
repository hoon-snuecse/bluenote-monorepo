import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 인증 체크
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: '사용자 이메일을 찾을 수 없습니다.' },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(req.url);

    // 쿼리 파라미터
    const gradeLevel = searchParams.get('gradeLevel');
    const writingType = searchParams.get('writingType');
    const schoolName = searchParams.get('schoolName');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // 필터 조건 생성
    const where: any = {
      isShared: true,
      // 자신의 과제는 제외
      userEmail: { not: userEmail },
      // 샘플 과제는 제외
      isSample: false,
    };

    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }

    if (writingType) {
      where.writingType = writingType;
    }

    if (schoolName) {
      where.schoolName = schoolName;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { gradingCriteria: { contains: search, mode: 'insensitive' } },
        { schoolName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 정렬 옵션
    let orderBy: any = {};
    if (sort === 'latest') {
      orderBy = { sharedAt: 'desc' };
    } else if (sort === 'popular') {
      // 추후 copyCount 필드 추가 시 사용
      orderBy = { sharedAt: 'desc' };
    }

    // 전체 개수 조회
    const total = await prisma.assignment.count({ where });

    // 공유된 과제 목록 조회
    const assignments = await prisma.assignment.findMany({
      where,
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
        sharedAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // 응답 데이터 가공
    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      schoolName: assignment.schoolName,
      gradeLevel: assignment.gradeLevel,
      writingType: assignment.writingType,
      evaluationDomains: assignment.evaluationDomains,
      evaluationLevels: assignment.evaluationLevels,
      levelCount: assignment.levelCount,
      gradingCriteria: assignment.gradingCriteria,
      sharedAt: assignment.sharedAt,
      sharedBy: assignment.user?.name || assignment.user?.email || '알 수 없음',
      sharedByEmail: assignment.user?.email,
      // 복사 횟수는 추후 구현
      copyCount: 0,
      // 사용 중인 교사 수 (임시로 submissions 수로 표시)
      usageCount: assignment._count.submissions,
    }));

    return NextResponse.json({
      success: true,
      assignments: formattedAssignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('공유 과제 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '공유 과제 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}