import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { checkAssignmentPermission } from '@/lib/assignment-auth';

export async function GET(request: NextRequest) {
  try {
    // CORS 헤더 설정
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 인증 확인
    const session = await getServerSession();
    const userEmail = session?.user?.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401, headers }
      );
    }

    // 쿼리 파라미터에서 assignmentId 가져오기
    const searchParams = request.nextUrl.searchParams;
    const assignmentId = searchParams.get('assignmentId');
    
    if (!assignmentId) {
      return NextResponse.json(
        { error: '과제 ID가 필요합니다.' },
        { status: 400, headers }
      );
    }

    // 권한 확인
    const permission = await checkAssignmentPermission(assignmentId, userEmail);
    if (!permission.canView) {
      return NextResponse.json(
        { error: '이 과제의 통계를 볼 권한이 없습니다.' },
        { status: 403, headers }
      );
    }

    // 과제 정보 가져오기
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        title: true,
        isShared: true,
        userEmail: true,
        userId: true
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404, headers }
      );
    }

    // 과제에 대한 모든 평가 가져오기
    const evaluations = await prisma.evaluation.findMany({
      where: { assignmentId },
      select: {
        id: true,
        evaluatedBy: true,
        evaluatedByUser: true,
        userId: true,
        evaluatedAt: true,
        studentId: true
      }
    });

    // 평가자별 통계 집계
    const evaluatorStats: Record<string, {
      email: string;
      userId: string | null;
      totalEvaluations: number;
      modelUsage: Record<string, number>;
      lastEvaluatedAt: Date | null;
      uniqueStudents: Set<string>;
    }> = {};

    evaluations.forEach(evaluation => {
      const evaluatorEmail = evaluation.evaluatedByUser || 'Unknown';
      const model = (evaluation.evaluatedBy || '').toLowerCase();
      
      if (!evaluatorStats[evaluatorEmail]) {
        evaluatorStats[evaluatorEmail] = {
          email: evaluatorEmail,
          userId: evaluation.userId,
          totalEvaluations: 0,
          modelUsage: { sonnet: 0, opus: 0, mock: 0 },
          lastEvaluatedAt: null,
          uniqueStudents: new Set()
        };
      }
      
      evaluatorStats[evaluatorEmail].totalEvaluations++;
      
      if (evaluation.studentId) {
        evaluatorStats[evaluatorEmail].uniqueStudents.add(evaluation.studentId);
      }
      
      // 모델별 사용 횟수
      if (model.includes('sonnet')) {
        evaluatorStats[evaluatorEmail].modelUsage.sonnet++;
      } else if (model.includes('opus')) {
        evaluatorStats[evaluatorEmail].modelUsage.opus++;
      } else if (model.includes('mock')) {
        evaluatorStats[evaluatorEmail].modelUsage.mock++;
      }
      
      // 최근 평가 시간
      if (!evaluatorStats[evaluatorEmail].lastEvaluatedAt || 
          evaluation.evaluatedAt > evaluatorStats[evaluatorEmail].lastEvaluatedAt!) {
        evaluatorStats[evaluatorEmail].lastEvaluatedAt = evaluation.evaluatedAt;
      }
    });

    // 공유 사용자 정보 가져오기
    const sharedUsers = await prisma.sharedAssignment.findMany({
      where: { assignmentId },
      select: {
        sharedToEmail: true,
        permission: true,
        createdAt: true
      }
    });

    // 결과 포맷팅
    const formattedStats = Object.entries(evaluatorStats).map(([email, stats]) => ({
      email: stats.email,
      userId: stats.userId,
      totalEvaluations: stats.totalEvaluations,
      uniqueStudentCount: stats.uniqueStudents.size,
      modelUsage: stats.modelUsage,
      lastEvaluatedAt: stats.lastEvaluatedAt,
      isOwner: assignment.userEmail === email,
      sharedPermission: sharedUsers.find(su => su.sharedToEmail === email)?.permission
    }));

    // 전체 통계
    const totalStats = {
      totalEvaluations: evaluations.length,
      totalEvaluators: Object.keys(evaluatorStats).length,
      modelUsage: {
        sonnet: evaluations.filter(e => (e.evaluatedBy || '').toLowerCase().includes('sonnet')).length,
        opus: evaluations.filter(e => (e.evaluatedBy || '').toLowerCase().includes('opus')).length,
        mock: evaluations.filter(e => (e.evaluatedBy || '').toLowerCase().includes('mock')).length
      }
    };

    return NextResponse.json({
      assignment: {
        id: assignmentId,
        title: assignment.title,
        isShared: assignment.isShared,
        owner: assignment.userEmail
      },
      evaluatorStats: formattedStats,
      sharedUsers: sharedUsers.map(su => ({
        email: su.sharedToEmail,
        permission: su.permission,
        sharedAt: su.createdAt
      })),
      totalStats,
      userPermission: {
        canView: permission.canView,
        canEvaluate: permission.canEvaluate,
        canEdit: permission.canEdit,
        canShare: permission.canShare,
        isOwner: permission.isOwner
      }
    }, { headers });
  } catch (error) {
    console.error('과제별 평가자 통계 조회 오류:', error);
    return NextResponse.json(
      { 
        error: '과제별 평가자 통계 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}