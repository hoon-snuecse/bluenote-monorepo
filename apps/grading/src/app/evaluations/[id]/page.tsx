'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EvaluationHistory } from '@/components/evaluation/EvaluationHistory'
import { ArrowLeft, FileText, Calendar, History as HistoryIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Evaluation {
  id: string
  studentId: string
  studentName: string
  studentDbId?: string
  assignmentTitle: string
  evaluatedAt: string
  overallLevel: string
  domainEvaluations: any[]
  overallFeedback: string
  strengths: string[]
  improvementSuggestions: string[]
}

export default function EvaluationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    fetchEvaluation()
  }, [params.id])

  const fetchEvaluation = async () => {
    try {
      const response = await fetch(`/api/evaluations/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setEvaluation(data)
      }
    } catch (error) {
      console.error('Failed to fetch evaluation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">평가 정보를 찾을 수 없습니다.</p>
        <Button onClick={() => router.push('/dashboard')}>
          대시보드로 돌아가기
        </Button>
      </div>
    )
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case '매우 우수': return 'text-green-600'
      case '우수': return 'text-blue-600'
      case '보통': return 'text-yellow-600'
      case '미흡': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 상단 네비게이션 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
      </div>

      {/* 평가 정보 카드 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {evaluation.assignmentTitle}
              </CardTitle>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  학생: <span className="font-semibold">{evaluation.studentName}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  평가일: {format(new Date(evaluation.evaluatedAt), 'yyyy년 MM월 dd일', { locale: ko })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">종합 평가</p>
              <p className={`text-2xl font-bold ${getLevelColor(evaluation.overallLevel)}`}>
                {evaluation.overallLevel}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 영역별 평가 */}
          <div>
            <h3 className="font-semibold mb-3">영역별 평가</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {evaluation.domainEvaluations.map((domain: any, idx: number) => (
                <div key={idx} className="text-center">
                  <p className="text-sm text-gray-600 mb-1">{domain.domain}</p>
                  <p className={`font-semibold ${getLevelColor(domain.level)}`}>
                    {domain.level}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{domain.score}점</p>
                </div>
              ))}
            </div>
          </div>

          {/* 종합 피드백 */}
          <div>
            <h3 className="font-semibold mb-2">종합 피드백</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{evaluation.overallFeedback}</p>
          </div>

          {/* 강점 */}
          <div>
            <h3 className="font-semibold mb-2">강점</h3>
            <ul className="list-disc list-inside space-y-1">
              {evaluation.strengths.map((strength: string, idx: number) => (
                <li key={idx} className="text-gray-700">{strength}</li>
              ))}
            </ul>
          </div>

          {/* 개선 제안 */}
          <div>
            <h3 className="font-semibold mb-2">개선 제안</h3>
            <ul className="list-disc list-inside space-y-1">
              {evaluation.improvementSuggestions.map((suggestion: string, idx: number) => (
                <li key={idx} className="text-gray-700">{suggestion}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 평가 히스토리 토글 버튼 */}
      <div className="mb-4">
        <Button
          onClick={() => setShowHistory(!showHistory)}
          variant="outline"
          className="w-full"
        >
          <HistoryIcon className="h-4 w-4 mr-2" />
          {showHistory ? '평가 히스토리 숨기기' : '평가 히스토리 보기'}
        </Button>
      </div>

      {/* 평가 히스토리 */}
      {showHistory && (
        <EvaluationHistory
          studentId={evaluation.studentId}
          studentDbId={evaluation.studentDbId}
          studentName={evaluation.studentName}
        />
      )}
    </div>
  )
}