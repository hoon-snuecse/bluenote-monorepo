'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bluenote/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bluenote/ui'
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ZAxis
} from 'recharts'
import { Skeleton } from '@bluenote/ui'
import { BoxPlotChart } from './BoxPlotChart'
import { CorrelationMatrix } from './CorrelationMatrix'
import { calculateCorrelation, calculateMean, calculateStandardDeviation } from '@/utils/statistics'

interface AdvancedAnalyticsProps {
  evaluations: any[]
  assignments: any[]
  loading: boolean
}

export function AdvancedAnalytics({ evaluations, assignments, loading }: AdvancedAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'average' | 'distribution' | 'correlation'>('average')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')

  // 시계열 데이터 준비 (과제별 평균 점수)
  const timeSeriesData = useMemo(() => {
    const assignmentScores = new Map<string, { date: string; scores: number[]; title: string }>()
    
    evaluations.forEach(evaluation => {
      if (!evaluation.evaluatedAt || !evaluation.assignmentId) return
      
      const assignment = assignments.find(a => a.id === evaluation.assignmentId)
      if (!assignment) return
      
      const date = new Date(evaluation.evaluatedAt).toLocaleDateString('ko-KR')
      const key = `${assignment.id}-${date}`
      
      if (!assignmentScores.has(key)) {
        assignmentScores.set(key, {
          date,
          title: assignment.title,
          scores: []
        })
      }
      
      if (evaluation.averageScore) {
        assignmentScores.get(key)!.scores.push(evaluation.averageScore)
      }
    })
    
    // 평균 계산
    const result: any[] = []
    assignmentScores.forEach((value, key) => {
      const avg = value.scores.reduce((sum, score) => sum + score, 0) / value.scores.length
      result.push({
        date: value.date,
        assignment: value.title,
        averageScore: Math.round(avg)
      })
    })
    
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [evaluations, assignments])

  // 영역별 상관관계 데이터
  const correlationData = useMemo(() => {
    const domains = ['clarity', 'validity', 'structure', 'expression']
    const data: any[] = []
    
    evaluations.forEach(evaluation => {
      if (!evaluation.scores) return
      
      // 각 도메인 쌍의 상관관계를 위한 데이터 포인트 생성
      domains.forEach((domain1, i) => {
        domains.forEach((domain2, j) => {
          if (i < j && evaluation.scores[domain1] && evaluation.scores[domain2]) {
            data.push({
              x: evaluation.scores[domain1],
              y: evaluation.scores[domain2],
              xDomain: domain1,
              yDomain: domain2,
              studentName: evaluation.studentName
            })
          }
        })
      })
    })
    
    return data
  }, [evaluations])

  // 점수 분포 히트맵 데이터
  const heatmapData = useMemo(() => {
    const domains = ['clarity', 'validity', 'structure', 'expression']
    const scoreRanges = ['0-60', '60-70', '70-80', '80-90', '90-100']
    
    const heatmap = domains.map(domain => {
      const domainData: any = { domain: getDomainLabel(domain) }
      
      scoreRanges.forEach(range => {
        const [min, max] = range.split('-').map(Number)
        const count = evaluations.filter(e => {
          const score = e.scores?.[domain] || 0
          return score >= min && score < max
        }).length
        
        domainData[range] = count
      })
      
      return domainData
    })
    
    return heatmap
  }, [evaluations])

  // 학생별 성장 추이 데이터
  const growthData = useMemo(() => {
    const studentGrowth = new Map<string, any[]>()
    
    evaluations
      .sort((a, b) => new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime())
      .forEach(evaluation => {
        if (!evaluation.studentId || !evaluation.evaluatedAt) return
        
        if (!studentGrowth.has(evaluation.studentId)) {
          studentGrowth.set(evaluation.studentId, [])
        }
        
        const growthArray = studentGrowth.get(evaluation.studentId)!
        growthArray.push({
          date: new Date(evaluation.evaluatedAt).toLocaleDateString('ko-KR'),
          score: evaluation.averageScore || 0,
          studentName: evaluation.studentName
        })
      })
    
    // 성장률 계산
    const growthRates: any[] = []
    studentGrowth.forEach((scores, studentId) => {
      if (scores.length >= 2) {
        const firstScore = scores[0].score
        const lastScore = scores[scores.length - 1].score
        const growthRate = ((lastScore - firstScore) / firstScore) * 100
        
        growthRates.push({
          studentName: scores[0].studentName,
          studentId,
          initialScore: firstScore,
          finalScore: lastScore,
          growthRate: Math.round(growthRate * 10) / 10,
          evaluationCount: scores.length
        })
      }
    })
    
    return growthRates.sort((a, b) => b.growthRate - a.growthRate)
  }, [evaluations])

  function getDomainLabel(domain: string): string {
    const labels: Record<string, string> = {
      clarity: '명료성',
      validity: '타당성',
      structure: '구조',
      expression: '표현'
    }
    return labels[domain] || domain
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 분석 유형 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>고급 통계 분석</CardTitle>
          <CardDescription>
            평가 데이터의 심층 분석 및 인사이트
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeseries" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeseries">시계열 분석</TabsTrigger>
              <TabsTrigger value="correlation">상관관계</TabsTrigger>
              <TabsTrigger value="distribution">분포 분석</TabsTrigger>
              <TabsTrigger value="growth">성장 추이</TabsTrigger>
            </TabsList>

            {/* 시계열 분석 */}
            <TabsContent value="timeseries" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">과제별 평균 점수 추이</CardTitle>
                  <CardDescription>시간에 따른 평가 점수의 변화</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="averageScore" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                        name="평균 점수"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 상관관계 분석 */}
            <TabsContent value="correlation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">영역별 점수 상관관계</CardTitle>
                  <CardDescription>평가 영역 간의 상관성 분석</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">명료성 vs 타당성</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" name="명료성" domain={[0, 100]} />
                          <YAxis dataKey="y" name="타당성" domain={[0, 100]} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter 
                            data={correlationData.filter(d => d.xDomain === 'clarity' && d.yDomain === 'validity')}
                            fill="#3b82f6"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">구조 vs 표현</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" name="구조" domain={[0, 100]} />
                          <YAxis dataKey="y" name="표현" domain={[0, 100]} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter 
                            data={correlationData.filter(d => d.xDomain === 'structure' && d.yDomain === 'expression')}
                            fill="#10b981"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 분포 분석 */}
            <TabsContent value="distribution" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">영역별 점수 분포 히트맵</CardTitle>
                    <CardDescription>각 평가 영역의 점수 분포 현황</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={heatmapData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="domain" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="0-60" stackId="a" fill="#ef4444" name="0-60점" />
                        <Bar dataKey="60-70" stackId="a" fill="#f59e0b" name="60-70점" />
                        <Bar dataKey="70-80" stackId="a" fill="#eab308" name="70-80점" />
                        <Bar dataKey="80-90" stackId="a" fill="#3b82f6" name="80-90점" />
                        <Bar dataKey="90-100" stackId="a" fill="#22c55e" name="90-100점" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <BoxPlotChart evaluations={evaluations} />
              </div>
              
              {/* 상관계수 매트릭스 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">영역 간 상관계수</CardTitle>
                  <CardDescription>평가 영역 간의 상관관계 분석</CardDescription>
                </CardHeader>
                <CardContent>
                  <CorrelationMatrix evaluations={evaluations} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 성장 추이 */}
            <TabsContent value="growth" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">학생별 성장률 분석</CardTitle>
                  <CardDescription>첫 평가 대비 성장률 상위 학생</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {growthData.slice(0, 10).map((student, index) => (
                      <div key={student.studentId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{student.studentName}</p>
                            <p className="text-sm text-gray-500">
                              {student.initialScore}점 → {student.finalScore}점 ({student.evaluationCount}회 평가)
                            </p>
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${student.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {student.growthRate > 0 ? '+' : ''}{student.growthRate}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}