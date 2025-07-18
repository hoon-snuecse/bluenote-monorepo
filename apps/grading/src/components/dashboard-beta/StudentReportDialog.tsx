'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui'
import { Download, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@bluenote/ui'

interface StudentReportDialogProps {
  evaluation: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentReportDialog({ evaluation, open, onOpenChange }: StudentReportDialogProps) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const domains = [
    { key: 'clarity', label: '주장의 명확성' },
    { key: 'validity', label: '근거의 타당성' },
    { key: 'structure', label: '논리적 구조' },
    { key: 'expression', label: '설득력 있는 표현' },
  ]

  const getAchievementLevel = (score: number) => {
    if (score >= 90) return '매우 우수'
    if (score >= 80) return '우수'
    if (score >= 70) return '보통'
    if (score >= 60) return '미흡'
    return '매우 미흡'
  }

  const getAchievementColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    setError(null)

    try {
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ evaluationId: evaluation.id }),
      })

      if (!response.ok) {
        throw new Error('PDF 다운로드에 실패했습니다.')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `evaluation_${evaluation.studentName}_${evaluation.assignmentTitle}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('PDF 다운로드 오류:', err)
      setError(err instanceof Error ? err.message : 'PDF 다운로드 중 오류가 발생했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  if (!evaluation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>학생 평가 보고서</DialogTitle>
          <DialogDescription>
            {evaluation.studentName} - {evaluation.assignmentTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">학생 이름:</span> {evaluation.studentName}
              </div>
              <div>
                <span className="font-medium">학생 번호:</span> {evaluation.studentId}
              </div>
              <div>
                <span className="font-medium">평가일:</span>{' '}
                {new Date(evaluation.evaluatedAt).toLocaleDateString('ko-KR')}
              </div>
              <div>
                <span className="font-medium">평가 차수:</span> {evaluation.round}차
              </div>
            </CardContent>
          </Card>

          {/* 평가 결과 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">평가 결과 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {evaluation.averageScore}점
                  </div>
                  <div className="text-sm text-gray-600">평균 점수</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getAchievementColor(evaluation.averageScore)}`}>
                    {getAchievementLevel(evaluation.averageScore)}
                  </div>
                  <div className="text-sm text-gray-600">종합 성취도</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 영역별 평가 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">영역별 상세 평가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {domains.map((domain) => {
                const score = evaluation.scores?.[domain.key] || 0
                const domainEval = evaluation.domainEvaluations?.[domain.key] || {}
                
                return (
                  <div key={domain.key} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{domain.label}</h4>
                      <div className="text-right">
                        <div className="text-lg font-bold">{score}점</div>
                        <div className={`text-sm ${getAchievementColor(score)}`}>
                          {getAchievementLevel(score)}
                        </div>
                      </div>
                    </div>
                    {domainEval.feedback && (
                      <p className="text-sm text-gray-600 mt-2">{domainEval.feedback}</p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* 종합 피드백 */}
          {evaluation.overallFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">종합 피드백</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{evaluation.overallFeedback}</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                다운로드 중...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                PDF 다운로드
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}