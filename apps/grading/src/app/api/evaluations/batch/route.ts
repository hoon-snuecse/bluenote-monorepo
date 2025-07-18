import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { evaluateWithClaude } from '@/utils/ai-evaluator'
import { broadcastBatchUpdate } from './stream/route'

// 메모리 기반 큐 (실제 환경에서는 Redis 등 사용 권장)
const evaluationQueue: Map<string, any> = new Map()
const jobStatus: Map<string, any> = new Map()

// 배치 평가 작업 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId, studentIds } = await request.json()

    if (!assignmentId || !studentIds || studentIds.length === 0) {
      return NextResponse.json(
        { error: '과제 ID와 학생 목록이 필요합니다.' },
        { status: 400 }
      )
    }

    // 과제 정보 조회
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { rubric: true }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 배치 작업 생성
    const jobId = uuidv4()
    const job = {
      id: jobId,
      assignmentId,
      studentIds,
      status: 'pending',
      progress: {
        total: studentIds.length,
        completed: 0,
        failed: 0
      },
      startedAt: null,
      completedAt: null,
      errors: [],
      createdBy: session.user?.email || 'unknown',
      createdAt: new Date()
    }

    jobStatus.set(jobId, job)

    // 각 학생에 대한 평가 작업을 큐에 추가
    for (const studentId of studentIds) {
      const queueItem = {
        id: uuidv4(),
        jobId,
        studentId,
        assignmentId,
        status: 'pending',
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      evaluationQueue.set(queueItem.id, queueItem)
    }

    // 비동기로 평가 처리 시작
    processQueue()

    return NextResponse.json({
      success: true,
      jobId,
      message: `${studentIds.length}명의 학생 평가가 대기열에 추가되었습니다.`
    })
  } catch (error) {
    console.error('배치 평가 생성 오류:', error)
    return NextResponse.json(
      { error: '배치 평가 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 배치 작업 상태 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (jobId) {
      // 특정 작업 상태 조회
      const job = jobStatus.get(jobId)
      if (!job) {
        return NextResponse.json(
          { error: '작업을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 큐에 있는 항목들의 상태 확인
      const queueItems = Array.from(evaluationQueue.values())
        .filter(item => item.jobId === jobId)

      return NextResponse.json({
        job,
        queueItems,
        summary: {
          pending: queueItems.filter(item => item.status === 'pending').length,
          processing: queueItems.filter(item => item.status === 'processing').length,
          completed: queueItems.filter(item => item.status === 'completed').length,
          failed: queueItems.filter(item => item.status === 'failed').length,
          retrying: queueItems.filter(item => item.status === 'retrying').length
        }
      })
    } else {
      // 모든 작업 목록 조회
      const jobs = Array.from(jobStatus.values())
        .filter(job => job.createdBy === session.user?.email)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return NextResponse.json({ jobs })
    }
  } catch (error) {
    console.error('배치 작업 조회 오류:', error)
    return NextResponse.json(
      { error: '작업 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 큐 처리 함수
async function processQueue() {
  const pendingItems = Array.from(evaluationQueue.values())
    .filter(item => item.status === 'pending' || item.status === 'retrying')
    .slice(0, 3) // 동시에 3개씩 처리

  for (const item of pendingItems) {
    processQueueItem(item)
  }

  // 대기 중인 항목이 있으면 5초 후 다시 처리
  const hasMoreItems = Array.from(evaluationQueue.values())
    .some(item => item.status === 'pending' || item.status === 'retrying')
  
  if (hasMoreItems) {
    setTimeout(() => processQueue(), 5000)
  }
}

// 개별 평가 처리
async function processQueueItem(item: any) {
  try {
    // 상태를 처리 중으로 변경
    item.status = 'processing'
    item.updatedAt = new Date()
    evaluationQueue.set(item.id, item)
    
    // 진행 상황 브로드캐스트
    broadcastBatchUpdate(item.jobId, {
      type: 'progress',
      itemId: item.id,
      status: 'processing'
    })

    // 작업 시작 표시
    const job = jobStatus.get(item.jobId)
    if (job && !job.startedAt) {
      job.startedAt = new Date()
      job.status = 'processing'
      jobStatus.set(item.jobId, job)
    }

    // 학생과 제출물 정보 조회
    const student = await prisma.student.findUnique({
      where: { id: item.studentId }
    })

    const submission = await prisma.submission.findFirst({
      where: {
        studentId: item.studentId,
        assignmentId: item.assignmentId
      }
    })

    if (!student || !submission) {
      throw new Error('학생 또는 제출물을 찾을 수 없습니다.')
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: item.assignmentId },
      include: { rubric: true }
    })

    // AI 평가 실행
    const evaluation = await evaluateWithClaude({
      content: submission.content,
      rubric: assignment!.rubric!,
      studentName: student.name
    })

    // 평가 결과 저장
    await prisma.evaluation.create({
      data: {
        assignmentId: item.assignmentId,
        studentId: item.studentId,
        domainScores: evaluation.domainScores,
        domainEvaluations: evaluation.domainEvaluations,
        overallScore: evaluation.overallScore,
        overallLevel: evaluation.overallLevel,
        overallFeedback: evaluation.overallFeedback,
        round: 1,
        status: 'completed'
      }
    })

    // 성공 처리
    item.status = 'completed'
    item.result = evaluation
    item.updatedAt = new Date()
    evaluationQueue.set(item.id, item)
    
    // 완료 브로드캐스트
    broadcastBatchUpdate(item.jobId, {
      type: 'progress',
      itemId: item.id,
      status: 'completed'
    })

    // 작업 진행 상황 업데이트
    if (job) {
      job.progress.completed++
      if (job.progress.completed + job.progress.failed >= job.progress.total) {
        job.status = 'completed'
        job.completedAt = new Date()
      }
      jobStatus.set(item.jobId, job)
    }

  } catch (error: any) {
    console.error('평가 처리 오류:', error)
    
    // 재시도 처리
    if (item.retryCount < item.maxRetries) {
      item.retryCount++
      item.status = 'retrying'
      item.error = error.message
      item.updatedAt = new Date()
      evaluationQueue.set(item.id, item)
    } else {
      // 최종 실패
      item.status = 'failed'
      item.error = error.message
      item.updatedAt = new Date()
      evaluationQueue.set(item.id, item)

      // 작업 오류 기록
      const job = jobStatus.get(item.jobId)
      if (job) {
        job.progress.failed++
        job.errors.push({
          studentId: item.studentId,
          error: error.message,
          timestamp: new Date()
        })
        
        if (job.progress.completed + job.progress.failed >= job.progress.total) {
          job.status = job.progress.failed > 0 ? 'failed' : 'completed'
          job.completedAt = new Date()
        }
        jobStatus.set(item.jobId, job)
      }
    }
  }
}