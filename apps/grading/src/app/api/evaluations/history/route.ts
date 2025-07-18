import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')
    const studentDbId = searchParams.get('studentDbId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!studentId && !studentDbId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // 학생의 평가 이력 조회
    const evaluations = await prisma.evaluation.findMany({
      where: studentDbId ? { studentDbId } : { studentId },
      include: {
        submission: {
          include: {
            assignment: true
          }
        }
      },
      orderBy: { evaluatedAt: 'desc' },
      take: limit
    })

    // 평가 이력 데이터 구성
    const history = evaluations.map(evaluation => ({
      id: evaluation.id,
      evaluatedAt: evaluation.evaluatedAt,
      assignmentTitle: evaluation.submission.assignment.title,
      assignmentId: evaluation.submission.assignment.id,
      writingType: evaluation.submission.assignment.writingType,
      gradeLevel: evaluation.submission.assignment.gradeLevel,
      overallLevel: evaluation.overallLevel,
      domainEvaluations: evaluation.domainEvaluations,
      strengths: evaluation.strengths,
      improvementSuggestions: evaluation.improvementSuggestions
    }))

    // 성장 추이 분석
    const growthAnalysis = analyzeGrowth(evaluations)

    return NextResponse.json({
      history,
      growthAnalysis,
      totalCount: evaluations.length
    })
  } catch (error) {
    console.error('Error fetching evaluation history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluation history' },
      { status: 500 }
    )
  }
}

// 성장 추이 분석 함수
function analyzeGrowth(evaluations: any[]) {
  if (evaluations.length < 2) {
    return { hasData: false }
  }

  // 영역별 성장 추이
  const domainGrowth: Record<string, number[]> = {}
  const overallLevels: string[] = []

  evaluations.reverse().forEach(evaluation => {
    overallLevels.push(evaluation.overallLevel)
    
    const domains = evaluation.domainEvaluations as any[]
    domains.forEach((domain: any) => {
      if (!domainGrowth[domain.domain]) {
        domainGrowth[domain.domain] = []
      }
      // 레벨을 숫자로 변환 (예: "매우 우수" = 4, "우수" = 3, etc.)
      const levelScore = convertLevelToScore(domain.level)
      domainGrowth[domain.domain].push(levelScore)
    })
  })

  return {
    hasData: true,
    domainGrowth,
    overallLevels,
    improvementRate: calculateImprovementRate(domainGrowth)
  }
}

// 레벨을 점수로 변환
function convertLevelToScore(level: string): number {
  const levelMap: Record<string, number> = {
    '매우 우수': 4,
    '우수': 3,
    '보통': 2,
    '미흡': 1
  }
  return levelMap[level] || 0
}

// 개선율 계산
function calculateImprovementRate(domainGrowth: Record<string, number[]>): number {
  let totalImprovement = 0
  let domainCount = 0

  Object.values(domainGrowth).forEach(scores => {
    if (scores.length >= 2) {
      const improvement = scores[scores.length - 1] - scores[0]
      totalImprovement += improvement
      domainCount++
    }
  })

  return domainCount > 0 ? totalImprovement / domainCount : 0
}