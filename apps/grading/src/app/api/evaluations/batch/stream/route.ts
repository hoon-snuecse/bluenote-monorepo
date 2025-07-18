import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// 배치 작업별 SSE 연결 관리
const batchConnections = new Map<string, Set<ReadableStreamDefaultController>>()

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return new Response('Job ID is required', { status: 400 })
  }

  const stream = new ReadableStream({
    start(controller) {
      // 연결 추가
      if (!batchConnections.has(jobId)) {
        batchConnections.set(jobId, new Set())
      }
      batchConnections.get(jobId)!.add(controller)

      // 초기 연결 메시지
      const encoder = new TextEncoder()
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'connected',
            jobId,
            timestamp: new Date().toISOString()
          })}\n\n`
        )
      )

      // 연결 종료 시 정리
      request.signal.addEventListener('abort', () => {
        batchConnections.get(jobId)?.delete(controller)
        if (batchConnections.get(jobId)?.size === 0) {
          batchConnections.delete(jobId)
        }
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// 배치 작업 업데이트 브로드캐스트 함수
export function broadcastBatchUpdate(jobId: string, update: any) {
  const connections = batchConnections.get(jobId)
  if (!connections) return

  const encoder = new TextEncoder()
  const data = encoder.encode(
    `data: ${JSON.stringify({
      type: update.type || 'update',
      jobId,
      ...update,
      timestamp: new Date().toISOString()
    })}\n\n`
  )

  connections.forEach(controller => {
    try {
      controller.enqueue(data)
    } catch (error) {
      // 연결이 끊긴 경우 제거
      connections.delete(controller)
    }
  })
}