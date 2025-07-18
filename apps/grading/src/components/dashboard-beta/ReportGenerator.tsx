'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bluenote/ui'
import { Label } from '@bluenote/ui'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@bluenote/ui'

interface ReportGeneratorProps {
  selectedAssignmentId: string
  assignmentTitle?: string
}

export function ReportGenerator({ selectedAssignmentId, assignmentTitle }: ReportGeneratorProps) {
  const [format, setFormat] = useState<'excel' | 'pdf' | 'json'>('excel')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleGenerateReport = async () => {
    if (!selectedAssignmentId) {
      setError('과제를 선택해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(
        `/api/reports/comprehensive?assignmentId=${selectedAssignmentId}&format=${format}`
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '보고서 생성에 실패했습니다.')
      }

      if (format === 'json') {
        // JSON 형식인 경우 파일로 다운로드
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `evaluation_report_${selectedAssignmentId}_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSuccess('JSON 보고서가 다운로드되었습니다.')
      } else if (format === 'excel') {
        // Excel 파일 다운로드
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `evaluation_report_${selectedAssignmentId}_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSuccess('Excel 보고서가 다운로드되었습니다.')
      } else if (format === 'pdf') {
        // PDF 보고서 생성
        // 먼저 평가 목록을 가져옵니다
        const evaluationsResponse = await fetch(
          `/api/evaluations?assignmentId=${selectedAssignmentId}`
        )
        
        if (!evaluationsResponse.ok) {
          throw new Error('평가 목록을 가져올 수 없습니다.')
        }
        
        const { evaluations } = await evaluationsResponse.json()
        
        if (!evaluations || evaluations.length === 0) {
          setError('평가 결과가 없습니다.')
          return
        }
        
        // 각 평가에 대해 PDF 생성
        for (const evaluation of evaluations) {
          const pdfResponse = await fetch('/api/reports/pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ evaluationId: evaluation.id }),
          })
          
          if (!pdfResponse.ok) {
            console.error(`PDF 생성 실패: ${evaluation.studentName}`)
            continue
          }
          
          const blob = await pdfResponse.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `evaluation_${evaluation.studentName}_${assignmentTitle || selectedAssignmentId}.pdf`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          // 다음 다운로드 전에 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        setSuccess(`${evaluations.length}개의 PDF 보고서가 다운로드되었습니다.`)
      }
    } catch (err) {
      console.error('보고서 생성 오류:', err)
      setError(err instanceof Error ? err.message : '보고서 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getFormatIcon = () => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5" />
      case 'pdf':
        return <FileText className="h-5 w-5" />
      case 'json':
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>종합 보고서 생성</CardTitle>
          <CardDescription>
            전체 학생의 평가 결과를 하나의 파일로 다운로드합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedAssignmentId ? (
            <Alert>
              <AlertDescription>
                보고서를 생성하려면 먼저 과제를 선택해주세요.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label>선택된 과제</Label>
                <p className="text-sm text-muted-foreground">
                  {assignmentTitle || selectedAssignmentId}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">파일 형식</Label>
                <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel (.xlsx)
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        JSON (.json)
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF (.pdf)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    보고서 생성 중...
                  </>
                ) : (
                  <>
                    {getFormatIcon()}
                    <span className="ml-2">보고서 다운로드</span>
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>보고서 내용</CardTitle>
          <CardDescription>
            생성되는 보고서에는 다음 정보가 포함됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>학생별 평가 결과 (학번, 이름, 점수, 수준)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>영역별 점수 (명료성, 타당성, 구조, 표현)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>종합 평가 내용 및 피드백</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>전체 통계 (평균 점수, 수준별 분포)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}