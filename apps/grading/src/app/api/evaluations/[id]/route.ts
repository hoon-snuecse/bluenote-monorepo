import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { id: params.id },
      include: {
        submission: {
          include: {
            assignment: true,
            student: true
          }
        }
      }
    })

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      )
    }

    // 평가 데이터 구성
    const evaluationData = {
      id: evaluation.id,
      studentId: evaluation.studentId,
      studentName: evaluation.submission.student?.name || 'Unknown',
      studentDbId: evaluation.studentDbId,
      assignmentTitle: evaluation.submission.assignment.title,
      evaluatedAt: evaluation.evaluatedAt,
      overallLevel: evaluation.overallLevel,
      domainEvaluations: evaluation.domainEvaluations,
      overallFeedback: evaluation.overallFeedback,
      strengths: evaluation.strengths,
      improvementSuggestions: evaluation.improvementSuggestions
    }

    return NextResponse.json(evaluationData)
  } catch (error) {
    console.error('Error fetching evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluation' },
      { status: 500 }
    )
  }
}