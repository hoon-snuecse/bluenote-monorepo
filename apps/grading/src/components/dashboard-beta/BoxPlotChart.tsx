'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ErrorBar } from 'recharts'
import { calculateQuartiles, calculateMean } from '@/utils/statistics'

interface BoxPlotChartProps {
  evaluations: any[]
  domain?: string
}

export function BoxPlotChart({ evaluations, domain = 'all' }: BoxPlotChartProps) {
  const boxPlotData = useMemo(() => {
    const domains = ['clarity', 'validity', 'structure', 'expression']
    const domainLabels: Record<string, string> = {
      clarity: '명료성',
      validity: '타당성',
      structure: '구조',
      expression: '표현'
    }
    
    if (domain !== 'all') {
      // 특정 도메인의 점수 분포
      const scores = evaluations
        .map(e => e.scores?.[domain])
        .filter(score => score !== undefined && score !== null)
      
      if (scores.length === 0) return []
      
      const quartiles = calculateQuartiles(scores)
      const mean = calculateMean(scores)
      
      return [{
        name: domainLabels[domain] || domain,
        min: quartiles.min,
        q1: quartiles.q1,
        median: quartiles.q2,
        q3: quartiles.q3,
        max: quartiles.max,
        mean: Math.round(mean),
        iqr: quartiles.q3 - quartiles.q1
      }]
    }
    
    // 모든 도메인의 점수 분포
    return domains.map(d => {
      const scores = evaluations
        .map(e => e.scores?.[d])
        .filter(score => score !== undefined && score !== null)
      
      if (scores.length === 0) {
        return {
          name: domainLabels[d],
          min: 0,
          q1: 0,
          median: 0,
          q3: 0,
          max: 0,
          mean: 0,
          iqr: 0
        }
      }
      
      const quartiles = calculateQuartiles(scores)
      const mean = calculateMean(scores)
      
      return {
        name: domainLabels[d],
        min: quartiles.min,
        q1: quartiles.q1,
        median: quartiles.q2,
        q3: quartiles.q3,
        max: quartiles.max,
        mean: Math.round(mean),
        iqr: quartiles.q3 - quartiles.q1
      }
    })
  }, [evaluations, domain])
  
  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">최대값: {data.max}</p>
          <p className="text-sm">Q3: {data.q3}</p>
          <p className="text-sm">중앙값: {data.median}</p>
          <p className="text-sm">평균: {data.mean}</p>
          <p className="text-sm">Q1: {data.q1}</p>
          <p className="text-sm">최소값: {data.min}</p>
        </div>
      )
    }
    return null
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">평가 영역별 점수 분포</CardTitle>
        <CardDescription>박스플롯으로 보는 점수 분포</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={boxPlotData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* 최소-최대 범위 (수염) */}
            <Bar dataKey="min" fill="transparent" stackId="stack">
              <ErrorBar 
                dataKey="iqr" 
                width={4} 
                stroke="#6b7280" 
                strokeWidth={1}
                direction="y"
              />
            </Bar>
            
            {/* Q1-Q3 범위 (박스) */}
            <Bar dataKey="q1" fill="#e5e7eb" stackId="stack" />
            <Bar dataKey="iqr" fill="#3b82f6" stackId="stack" />
            
            {/* 중앙값 표시 */}
            {boxPlotData.map((entry, index) => (
              <Bar
                key={`median-${index}`}
                dataKey={() => entry.median}
                fill="#1e40af"
                barSize={20}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}