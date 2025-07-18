'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Skeleton } from '@bluenote/ui'

interface EvaluationChartsProps {
  evaluations: any[]
  loading: boolean
}

export function EvaluationCharts({ evaluations, loading }: EvaluationChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
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

  // 평가 수준별 분포 데이터 준비
  const levelDistribution = [
    { level: '매우 우수', count: 0, fill: '#22c55e' },
    { level: '우수', count: 0, fill: '#3b82f6' },
    { level: '보통', count: 0, fill: '#f59e0b' },
    { level: '미흡', count: 0, fill: '#ef4444' },
  ]

  evaluations.forEach(evaluation => {
    const avgScore = evaluation.averageScore || 0
    if (avgScore >= 90) levelDistribution[0].count++
    else if (avgScore >= 80) levelDistribution[1].count++
    else if (avgScore >= 70) levelDistribution[2].count++
    else levelDistribution[3].count++
  })

  // 영역별 평균 점수 데이터 준비
  const domainAverages = [
    { domain: '명료성', score: 0 },
    { domain: '타당성', score: 0 },
    { domain: '구조', score: 0 },
    { domain: '표현', score: 0 },
  ]

  if (evaluations.length > 0) {
    const totals = { clarity: 0, validity: 0, structure: 0, expression: 0 }
    evaluations.forEach(evaluation => {
      if (evaluation.scores) {
        totals.clarity += evaluation.scores.clarity || 0
        totals.validity += evaluation.scores.validity || 0
        totals.structure += evaluation.scores.structure || 0
        totals.expression += evaluation.scores.expression || 0
      }
    })
    
    const count = evaluations.length
    domainAverages[0].score = Math.round(totals.clarity / count)
    domainAverages[1].score = Math.round(totals.validity / count)
    domainAverages[2].score = Math.round(totals.structure / count)
    domainAverages[3].score = Math.round(totals.expression / count)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 평가 수준 분포 */}
      <Card>
        <CardHeader>
          <CardTitle>평가 수준 분포</CardTitle>
          <CardDescription>전체 학생의 평가 수준별 분포</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill={(entry: any) => entry.fill}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 영역별 평균 점수 */}
      <Card>
        <CardHeader>
          <CardTitle>영역별 평균 점수</CardTitle>
          <CardDescription>4개 평가 영역의 평균 점수</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={domainAverages}>
              <PolarGrid />
              <PolarAngleAxis dataKey="domain" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="평균 점수" 
                dataKey="score" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6} 
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}