'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { Progress } from '@bluenote/ui'
import { Alert, AlertDescription } from '@bluenote/ui'
import { Badge } from '@bluenote/ui'
import { ScrollArea } from '@bluenote/ui'
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Users
} from 'lucide-react'

interface BatchEvaluationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignmentId: string
  studentIds: string[]
  onComplete?: () => void
}

export function BatchEvaluationDialog({
  open,
  onOpenChange,
  assignmentId,
  studentIds,
  onComplete
}: BatchEvaluationDialogProps) {
  const [jobId, setJobId] = useState<string | null>(null)
  const [job, setJob] = useState<any>(null)
  const [queueItems, setQueueItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  // 배치 평가 시작
  const startBatchEvaluation = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/evaluations/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          studentIds,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '배치 평가 시작에 실패했습니다.')
      }

      const data = await response.json()
      setJobId(data.jobId)
      
      // SSE 연결 시작
      const es = new EventSource(`/api/evaluations/batch/stream?jobId=${data.jobId}`)
      
      es.onmessage = (event) => {
        const update = JSON.parse(event.data)
        if (update.type === 'progress') {
          fetchJobStatus(data.jobId)
        }
      }
      
      es.onerror = (error) => {
        console.error('SSE 오류:', error)
      }
      
      setEventSource(es)
      
      // 초기 상태 조회
      fetchJobStatus(data.jobId)
    } catch (err) {
      console.error('배치 평가 시작 오류:', err)
      setError(err instanceof Error ? err.message : '배치 평가 시작 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 작업 상태 조회
  const fetchJobStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/evaluations/batch?jobId=${id}`)
      
      if (!response.ok) {
        throw new Error('작업 상태 조회에 실패했습니다.')
      }

      const data = await response.json()
      setJob(data.job)
      setQueueItems(data.queueItems)

      // 작업 완료 시 콜백 호출
      if (data.job.status === 'completed' && onComplete) {
        onComplete()
      }
    } catch (err) {
      console.error('작업 상태 조회 오류:', err)
    }
  }

  // 컴포넌트 언마운트 시 SSE 연결 종료
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [eventSource])

  // 다이얼로그 열릴 때 자동 시작
  useEffect(() => {
    if (open && studentIds.length > 0 && !jobId) {
      startBatchEvaluation()
    }
  }, [open])

  // 진행률 계산
  const progress = job ? (job.progress.completed + job.progress.failed) / job.progress.total * 100 : 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기 중</Badge>
      case 'processing':
        return <Badge variant="default">처리 중</Badge>
      case 'completed':
        return <Badge variant="success">완료</Badge>
      case 'failed':
        return <Badge variant="destructive">실패</Badge>
      case 'retrying':
        return <Badge variant="warning">재시도 중</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            배치 평가 진행
          </DialogTitle>
          <DialogDescription>
            {studentIds.length}명의 학생 평가를 진행하고 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {job && (
            <>
              {/* 진행 상황 요약 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>전체 진행률</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>완료: {job.progress.completed}</span>
                  <span>실패: {job.progress.failed}</span>
                  <span>전체: {job.progress.total}</span>
                </div>
              </div>

              {/* 상태별 요약 */}
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-semibold">{queueItems.filter(item => item.status === 'pending').length}</div>
                  <div className="text-xs text-gray-600">대기 중</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-lg font-semibold">{queueItems.filter(item => item.status === 'processing').length}</div>
                  <div className="text-xs text-blue-600">처리 중</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-lg font-semibold">{queueItems.filter(item => item.status === 'completed').length}</div>
                  <div className="text-xs text-green-600">완료</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="text-lg font-semibold">{queueItems.filter(item => item.status === 'retrying').length}</div>
                  <div className="text-xs text-orange-600">재시도</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="text-lg font-semibold">{queueItems.filter(item => item.status === 'failed').length}</div>
                  <div className="text-xs text-red-600">실패</div>
                </div>
              </div>

              {/* 오류 목록 */}
              {job.errors && job.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-semibold">평가 오류 ({job.errors.length}건)</div>
                      <ScrollArea className="h-20">
                        {job.errors.map((error: any, index: number) => (
                          <div key={index} className="text-xs">
                            {error.studentId}: {error.error}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* 개별 항목 상태 */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">평가 진행 상황</h4>
                <ScrollArea className="h-48 rounded border p-2">
                  <div className="space-y-1">
                    {queueItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                      >
                        <span className="text-sm">{item.studentId}</span>
                        <div className="flex items-center gap-2">
                          {item.status === 'processing' && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                          {item.status === 'completed' && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                          {item.status === 'failed' && (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          {item.status === 'retrying' && (
                            <RefreshCw className="h-3 w-3 text-orange-600 animate-spin" />
                          )}
                          {getStatusBadge(item.status)}
                          {item.retryCount > 0 && (
                            <span className="text-xs text-gray-500">
                              (재시도: {item.retryCount}/{item.maxRetries})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {loading && !job && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={job?.status === 'processing'}
          >
            {job?.status === 'processing' ? '처리 중...' : '닫기'}
          </Button>
          {job?.status === 'completed' && (
            <Button onClick={() => onOpenChange(false)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              완료
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}