'use client'

import { useState, useCallback, memo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { useRouter } from 'next/navigation'
import { Button } from '@bluenote/ui'
import { Checkbox } from '@bluenote/ui'
import { Badge } from '@bluenote/ui'
import { Input } from '@bluenote/ui'
import { FileText, Download, RefreshCw, Search } from 'lucide-react'
import { StudentReportDialog } from './StudentReportDialog'
import { BatchEvaluationDialog } from './BatchEvaluationDialog'

interface VirtualizedStudentGridProps {
  evaluations: any[]
  loading: boolean
  selectedAssignmentId: string
}

// 가상화된 행 컴포넌트
const StudentRow = memo(({ index, style, data }: any) => {
  const { 
    evaluations, 
    selectedStudents, 
    onSelectOne, 
    onViewReport 
  } = data
  
  const evaluation = evaluations[index]
  
  return (
    <div style={style} className="flex items-center border-b px-4">
      <div className="w-12">
        <Checkbox
          checked={selectedStudents.has(evaluation.id)}
          onCheckedChange={(checked) => onSelectOne(evaluation.id, checked)}
        />
      </div>
      <div className="flex-1 grid grid-cols-6 gap-4 py-2">
        <div className="font-mono">{evaluation.studentId}</div>
        <div>{evaluation.studentName}</div>
        <div>
          <Badge
            variant={evaluation.status === 'completed' ? 'default' : 'secondary'}
          >
            {evaluation.status === 'completed' ? '완료' : '대기'}
          </Badge>
        </div>
        <div>
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
        </div>
        <div>
          {evaluation.evaluatedAt ? 
            new Date(evaluation.evaluatedAt).toLocaleDateString('ko-KR') : 
            '-'
          }
        </div>
        <div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewReport(evaluation)}
            disabled={evaluation.status !== 'completed'}
          >
            <FileText className="h-4 w-4 mr-1" />
            보고서
          </Button>
        </div>
      </div>
    </div>
  )
})

StudentRow.displayName = 'StudentRow'

export function VirtualizedStudentGrid({ evaluations, loading, selectedAssignmentId }: VirtualizedStudentGridProps) {
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

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(filteredEvaluations.map(e => e.id)))
    } else {
      setSelectedStudents(new Set())
    }
  }, [filteredEvaluations])

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedStudents(prev => {
      const newSelected = new Set(prev)
      if (checked) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }
      return newSelected
    })
  }, [])

  const handleViewReport = useCallback((evaluation: any) => {
    setSelectedEvaluation(evaluation)
    setReportDialogOpen(true)
  }, [])

  const handleBatchEvaluate = () => {
    if (selectedStudents.size === 0) {
      alert('평가할 학생을 선택해주세요.')
      return
    }
    setBatchDialogOpen(true)
  }

  // 가상화를 위한 데이터
  const itemData = {
    evaluations: filteredEvaluations,
    selectedStudents,
    onSelectOne: handleSelectOne,
    onViewReport: handleViewReport
  }

  if (loading) {
    return <div className="flex justify-center py-8">로딩 중...</div>
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 액션 버튼 */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="학생 이름 또는 학번으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleBatchEvaluate}
            disabled={selectedStudents.size === 0}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            배치 평가 ({selectedStudents.size}명)
          </Button>
          <Button
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Excel 내보내기
          </Button>
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div className="border rounded-t-lg">
        <div className="flex items-center bg-gray-50 px-4 py-3 font-medium">
          <div className="w-12">
            <Checkbox
              checked={
                filteredEvaluations.length > 0 &&
                selectedStudents.size === filteredEvaluations.length
              }
              onCheckedChange={handleSelectAll}
            />
          </div>
          <div className="flex-1 grid grid-cols-6 gap-4">
            <div>학번</div>
            <div>이름</div>
            <div>상태</div>
            <div>점수</div>
            <div>평가 시간</div>
            <div>액션</div>
          </div>
        </div>
      </div>

      {/* 가상화된 학생 목록 */}
      <div className="border-x border-b rounded-b-lg">
        {filteredEvaluations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? '검색 결과가 없습니다.' : '평가 데이터가 없습니다.'}
          </div>
        ) : (
          <List
            height={600}
            itemCount={filteredEvaluations.length}
            itemSize={60}
            width="100%"
            itemData={itemData}
          >
            {StudentRow}
          </List>
        )}
      </div>

      {/* 다이얼로그 */}
      <StudentReportDialog
        evaluation={selectedEvaluation}
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
      />

      <BatchEvaluationDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        assignmentId={selectedAssignmentId}
        studentIds={Array.from(selectedStudents)}
        onComplete={() => {
          window.location.reload()
        }}
      />
    </div>
  )
}