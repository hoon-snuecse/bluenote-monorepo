'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { Checkbox } from '@bluenote/ui'
import { Badge } from '@bluenote/ui'
import { Input } from '@bluenote/ui'
import { FileText, Download, RefreshCw, Search } from 'lucide-react'
import { Skeleton } from '@bluenote/ui'
import { StudentReportDialog } from './StudentReportDialog'
import { BatchEvaluationDialog } from './BatchEvaluationDialog'

interface StudentGridProps {
  evaluations: any[]
  loading: boolean
  selectedAssignmentId: string
}

export function StudentGrid({ evaluations, loading, selectedAssignmentId }: StudentGridProps) {
  const router = useRouter()
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)

  const filteredEvaluations = evaluations.filter(evaluation => {
    const searchLower = searchQuery.toLowerCase()
    return (
      evaluation.studentName?.toLowerCase().includes(searchLower) ||
      evaluation.studentId?.toLowerCase().includes(searchLower)
    )
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(filteredEvaluations.map(e => e.id)))
    } else {
      setSelectedStudents(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedStudents(newSelected)
  }

  const handleViewReport = (evaluation: any) => {
    setSelectedEvaluation(evaluation)
    setReportDialogOpen(true)
  }

  const handleBatchEvaluate = () => {
    if (selectedStudents.size === 0) {
      alert('평가할 학생을 선택해주세요.')
      return
    }
    setBatchDialogOpen(true)
  }

  const handleExportExcel = () => {
    // TODO: Excel 내보내기 기능 구현
    alert('Excel 내보내기 기능은 개발 중입니다.')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 액션 바 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="학생 이름 또는 번호로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleBatchEvaluate}
            disabled={selectedStudents.size === 0}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            선택 평가하기 ({selectedStudents.size})
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Excel 내보내기
          </Button>
        </div>
      </div>

      {/* 학생 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredEvaluations.length > 0 &&
                    selectedStudents.size === filteredEvaluations.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>학번</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>점수</TableHead>
              <TableHead>평가 시간</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? '검색 결과가 없습니다.' : '평가 데이터가 없습니다.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredEvaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.has(evaluation.id)}
                      onCheckedChange={(checked) => 
                        handleSelectOne(evaluation.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-mono">{evaluation.studentId}</TableCell>
                  <TableCell>{evaluation.studentName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={evaluation.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {evaluation.status === 'completed' ? '완료' : '대기'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {evaluation.averageScore ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{evaluation.averageScore}점</span>
                        <span className="text-sm text-muted-foreground">
                          ({evaluation.level || '평가중'})
                        </span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {evaluation.evaluatedAt ? 
                      new Date(evaluation.evaluatedAt).toLocaleDateString('ko-KR') : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewReport(evaluation)}
                      disabled={evaluation.status !== 'completed'}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      보고서
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 학생 보고서 다이얼로그 */}
      <StudentReportDialog
        evaluation={selectedEvaluation}
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
      />

      {/* 배치 평가 다이얼로그 */}
      <BatchEvaluationDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        assignmentId={selectedAssignmentId}
        studentIds={Array.from(selectedStudents)}
        onComplete={() => {
          // 평가 완료 후 데이터 새로고침
          window.location.reload()
        }}
      />
    </div>
  )
}