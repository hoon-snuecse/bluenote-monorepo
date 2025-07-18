'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@bluenote/ui'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface EvaluationHistoryProps {
  studentId?: string
  studentDbId?: string
  studentName: string
}

interface HistoryItem {
  id: string
  evaluatedAt: string
  assignmentTitle: string
  assignmentId: string
  writingType: string
  gradeLevel: string
  overallLevel: string
  domainEvaluations: any[]
  strengths: string[]
  improvementSuggestions: string[]
}

interface GrowthAnalysis {
  hasData: boolean
  domainGrowth?: Record<string, number[]>
  overallLevels?: string[]
  improvementRate?: number
}

export function EvaluationHistory({ studentId, studentDbId, studentName }: EvaluationHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [growthAnalysis, setGrowthAnalysis] = useState<GrowthAnalysis>({ hasData: false })
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showChart, setShowChart] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [studentId, studentDbId])

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams()
      if (studentDbId) params.append('studentDbId', studentDbId)
      else if (studentId) params.append('studentId', studentId)
      params.append('limit', '20')

      const response = await fetch(`/api/evaluations/history?${params}`)
      const data = await response.json()

      if (response.ok) {
        setHistory(data.history)
        setGrowthAnalysis(data.growthAnalysis)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const prepareChartData = () => {
    if (!growthAnalysis.domainGrowth) return []

    const domains = Object.keys(growthAnalysis.domainGrowth)
    const maxLength = Math.max(...Object.values(growthAnalysis.domainGrowth).map(arr => arr.length))
    
    return Array.from({ length: maxLength }, (_, index) => {
      const dataPoint: any = { name: `평가 ${index + 1}` }
      domains.forEach(domain => {
        dataPoint[domain] = growthAnalysis.domainGrowth![domain][index] || 0
      })
      return dataPoint
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case '매우 우수': return 'bg-green-500'
      case '우수': return 'bg-blue-500'
      case '보통': return 'bg-yellow-500'
      case '미흡': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 성장 추이 차트 */}
      {growthAnalysis.hasData && growthAnalysis.domainGrowth && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {studentName} 학생의 성장 추이
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChart(!showChart)}
              >
                {showChart ? '차트 숨기기' : '차트 보기'}
              </Button>
            </div>
          </CardHeader>
          {showChart && (
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} />
                    <Tooltip 
                      formatter={(value: number) => {
                        const levels = ['', '미흡', '보통', '우수', '매우 우수']
                        return levels[Math.round(value)]
                      }}
                    />
                    <Legend />
                    {Object.keys(growthAnalysis.domainGrowth).map((domain, index) => (
                      <Line
                        key={domain}
                        type="monotone"
                        dataKey={domain}
                        stroke={chartColors[index % chartColors.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {growthAnalysis.improvementRate !== undefined && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    전체 개선율: 
                    <span className={`ml-2 font-semibold ${growthAnalysis.improvementRate > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {growthAnalysis.improvementRate > 0 ? '+' : ''}{(growthAnalysis.improvementRate * 25).toFixed(0)}%
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* 평가 이력 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            평가 이력
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              아직 평가 이력이 없습니다.
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.assignmentTitle}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(item.evaluatedAt), 'yyyy년 MM월 dd일', { locale: ko })}
                        </span>
                        <span>{item.writingType}</span>
                        <span>{item.gradeLevel}</span>
                      </div>
                    </div>
                    <Badge className={getLevelColor(item.overallLevel)}>
                      {item.overallLevel}
                    </Badge>
                  </div>

                  {/* 영역별 평가 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                    {item.domainEvaluations.map((domain: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        <span className="text-gray-600">{domain.domain}:</span>
                        <Badge variant="outline" className="ml-1 text-xs">
                          {domain.level}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* 상세 정보 토글 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(item.id)}
                    className="mt-3 w-full"
                  >
                    {expandedItems.has(item.id) ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        간략히 보기
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        자세히 보기
                      </>
                    )}
                  </Button>

                  {/* 상세 정보 */}
                  {expandedItems.has(item.id) && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <div>
                        <h5 className="font-medium text-sm mb-1">강점</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {item.strengths.map((strength: string, idx: number) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1">개선 제안</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {item.improvementSuggestions.map((suggestion: string, idx: number) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}