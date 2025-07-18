'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Download, FileText, Users, CheckCircle, XCircle } from 'lucide-react'
import { AssignmentSelector } from './AssignmentSelector'
import { EvaluationStatus } from './EvaluationStatus'
import { StudentGrid } from './StudentGrid'
import { EvaluationCharts } from './EvaluationCharts'
import { ActionButtons } from './ActionButtons'
import { ReportGenerator } from './ReportGenerator'
import { useAssignments } from '@/hooks/useAssignments'
import { useEvaluations } from '@/hooks/useEvaluations'

export function UnifiedDashboard() {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('all')
  const [selectedRound, setSelectedRound] = useState<number>(1)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  
  const { assignments, loading: assignmentsLoading } = useAssignments()
  const { evaluations, stats, loading: evaluationsLoading } = useEvaluations(
    selectedAssignmentId === 'all' ? undefined : selectedAssignmentId,
    selectedRound
  )

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
        </Card>
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
        
        {/* 과제 선택 */}
        <AssignmentSelector
          assignments={assignments}
          selectedAssignmentId={selectedAssignmentId}
          onAssignmentChange={setSelectedAssignmentId}
          loading={assignmentsLoading}
        />
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
          <EvaluationCharts
            evaluations={evaluations}
            loading={evaluationsLoading}
          />
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
          
          <StudentGrid
            evaluations={evaluations}
            loading={evaluationsLoading}
            selectedAssignmentId={selectedAssignmentId}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>고급 통계 분석</CardTitle>
              <CardDescription>
                평가 데이터의 심층 분석 및 인사이트
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">개발 중...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportGenerator 
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