'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bluenote/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bluenote/ui'
import { Loader2, Plus, Download, FileText, Users, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react'
import { AssignmentSelector } from './AssignmentSelector'
import { EvaluationStatus } from './EvaluationStatus'
import { ActionButtons } from './ActionButtons'
import { RealtimeUpdates } from './RealtimeUpdates'
import { 
  DynamicEvaluationCharts,
  DynamicAdvancedAnalytics,
  DynamicStudentGrid,
  DynamicReportGenerator
} from './DynamicComponents'
import { useAssignments } from '@/hooks/useAssignments'
import { useCachedEvaluations } from '@/hooks/useCachedEvaluations'
import { useEvaluationStream } from '@/hooks/useEvaluationStream'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { 
  FullPageLoading, 
  AssignmentListSkeleton, 
  StudentGridSkeleton, 
  ChartSkeleton 
} from '@/components/LoadingStates'
import { 
  NoAssignments, 
  NoStudents, 
  NoEvaluations, 
  ErrorState 
} from '@/components/EmptyStates'

export function UnifiedDashboard() {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('all')
  const [selectedRound, setSelectedRound] = useState<number>(1)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const { handleError } = useErrorHandler()
  
  const { assignments, loading: assignmentsLoading, error: assignmentsError, refetch: refetchAssignments } = useAssignments()
  const { 
    data, 
    loading: evaluationsLoading, 
    error: evaluationsError, 
    refetch 
  } = useCachedEvaluations(
    selectedAssignmentId === 'all' ? undefined : selectedAssignmentId,
    selectedRound
  )
  
  const evaluations = data?.evaluations || []
  const stats = data?.stats || null
  
  // SSE 연결
  const { updates, isConnected } = useEvaluationStream(
    selectedAssignmentId === 'all' ? null : selectedAssignmentId
  )
  
  // SSE 업데이트 시 데이터 새로고침
  useEffect(() => {
    if (updates.length > 0) {
      const latestUpdate = updates[updates.length - 1]
      if (latestUpdate.type === 'evaluation_completed' || latestUpdate.type === 'evaluation_started') {
        refetch()
      }
    }
  }, [updates, refetch])

  // 인증 상태 확인
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      })
      .catch(() => setIsAuthenticated(false))
  }, [])

  // 로그인 체크
  if (isAuthenticated === null) {
    return <FullPageLoading message="인증 확인 중..." />
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>로그인 필요</CardTitle>
            <CardDescription>
              대시보드를 사용하려면 로그인해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              로그인 페이지로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 과제 로딩 에러 처리
  if (assignmentsError) {
    return (
      <div className="container mx-auto p-6">
        <ErrorState 
          message="과제 목록을 불러올 수 없습니다."
          onRetry={refetchAssignments}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 영역 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">통합 평가 대시보드</h1>
          <p className="text-muted-foreground mt-1">
            과제 관리, 평가 실행, 결과 분석을 한 곳에서
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 실시간 연결 상태 */}
          {selectedAssignmentId !== 'all' && (
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">실시간 연결됨</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">연결 끊김</span>
                </>
              )}
            </div>
          )}
          
          {/* 과제 선택 */}
          <AssignmentSelector
            assignments={assignments}
            selectedAssignmentId={selectedAssignmentId}
            onAssignmentChange={setSelectedAssignmentId}
            loading={assignmentsLoading}
          />
        </div>
      </div>

      {/* 주요 액션 버튼 */}
      <ActionButtons
        selectedAssignmentId={selectedAssignmentId}
        onRefresh={() => {
          // 데이터 새로고침
          window.location.reload()
        }}
      />

      {/* 평가 현황 요약 카드 */}
      <EvaluationStatus
        stats={stats}
        loading={evaluationsLoading}
      />

      {/* 메인 콘텐츠 영역 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">전체 현황</TabsTrigger>
          <TabsTrigger value="students">학생별 상세</TabsTrigger>
          <TabsTrigger value="analytics">통계 분석</TabsTrigger>
          <TabsTrigger value="reports">보고서</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DynamicEvaluationCharts
                evaluations={evaluations}
                loading={evaluationsLoading}
              />
            </div>
            <div className="lg:col-span-1">
              <RealtimeUpdates updates={updates} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">평가 차수:</span>
              <Select
                value={selectedRound.toString()}
                onValueChange={(value) => setSelectedRound(Number(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1차</SelectItem>
                  <SelectItem value="2">2차</SelectItem>
                  <SelectItem value="3">3차</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DynamicStudentGrid
            evaluations={evaluations}
            loading={evaluationsLoading}
            selectedAssignmentId={selectedAssignmentId}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <DynamicAdvancedAnalytics
            evaluations={evaluations}
            assignments={assignments}
            loading={evaluationsLoading || assignmentsLoading}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <DynamicReportGenerator 
            selectedAssignmentId={selectedAssignmentId}
            assignmentTitle={
              selectedAssignmentId === 'all' 
                ? '전체 과제' 
                : assignments.find(a => a.id === selectedAssignmentId)?.title
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}