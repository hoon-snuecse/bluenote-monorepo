'use client'

import { useState, useCallback, memo, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { useRouter } from 'next/navigation'
import { Button } from '@bluenote/ui'
import { Checkbox } from '@bluenote/ui'
import { Badge } from '@bluenote/ui'
import { Input } from '@bluenote/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bluenote/ui'
import { FileText, Download, RefreshCw, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { StudentReportDialog } from './StudentReportDialog'
import { BatchEvaluationDialog } from './BatchEvaluationDialog'

interface VirtualizedStudentGridProps {
  evaluations: any[]
  loading: boolean
  selectedAssignmentId: string
}

type SortField = 'studentName' | 'studentId' | 'evaluatedAt' | 'status'
type SortOrder = 'asc' | 'desc'
type StatusFilter = 'all' | 'completed' | 'pending'

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
            title={evaluation.status === 'completed' ? '보고서' : '학생글'}
          >
            <FileText className="h-4 w-4 mr-1" />
            보기
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
  const [sortField, setSortField] = useState<SortField>('evaluatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // 필터링 및 정렬 로직
  const filteredAndSortedEvaluations = useMemo(() => {
    // 1. 검색 필터
    let filtered = evaluations.filter(evaluation => {
      const searchLower = searchQuery.toLowerCase()
      return (
        evaluation.studentName?.toLowerCase().includes(searchLower) ||
        evaluation.studentId?.toLowerCase().includes(searchLower)
      )
    })

    // 2. 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(evaluation => {
        if (statusFilter === 'completed') {
          return evaluation.status === 'completed'
        } else if (statusFilter === 'pending') {
          return evaluation.status !== 'completed'
        }
        return true
      })
    }

    // 3. 정렬
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'studentName':
          aValue = a.studentName || ''
          bValue = b.studentName || ''
          break
        case 'studentId':
          aValue = a.studentId || ''
          bValue = b.studentId || ''
          break
        case 'evaluatedAt':
          aValue = a.evaluatedAt ? new Date(a.evaluatedAt).getTime() : 0
          bValue = b.evaluatedAt ? new Date(b.evaluatedAt).getTime() : 0
          break
        case 'status':
          aValue = a.status === 'completed' ? 1 : 0
          bValue = b.status === 'completed' ? 1 : 0
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    return sorted
  }, [evaluations, searchQuery, statusFilter, sortField, sortOrder])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(filteredAndSortedEvaluations.map(e => e.id)))
    } else {
      setSelectedStudents(new Set())
    }
  }, [filteredAndSortedEvaluations])

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

  // 정렬 헤더 클릭 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // 정렬 아이콘 컴포넌트
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />
  }

  // 가상화를 위한 데이터
  const itemData = {
    evaluations: filteredAndSortedEvaluations,
    selectedStudents,
    onSelectOne: handleSelectOne,
    onViewReport: handleViewReport
  }

  if (loading) {
    return <div className="flex justify-center py-8">로딩 중...</div>
  }

  return (
    <div className="space-y-4">
      {/* 필터 및 정렬 컨트롤 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* 상태 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">상태:</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                전체
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
              >
                평가완료
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                미평가
              </Button>
            </div>
          </div>

          {/* 정렬 옵션 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">정렬:</span>
            <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-') as [SortField, SortOrder]
              setSortField(field)
              setSortOrder(order)
            }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studentName-asc">이름 (가나다순)</SelectItem>
                <SelectItem value="studentName-desc">이름 (역순)</SelectItem>
                <SelectItem value="studentId-asc">학번 (오름차순)</SelectItem>
                <SelectItem value="studentId-desc">학번 (내림차순)</SelectItem>
                <SelectItem value="evaluatedAt-desc">제출일시 (최신순)</SelectItem>
                <SelectItem value="evaluatedAt-asc">제출일시 (오래된순)</SelectItem>
                <SelectItem value="status-desc">평가완료 우선</SelectItem>
                <SelectItem value="status-asc">미평가 우선</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 액션 버튼 */}
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

      {/* 검색 */}
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
      </div>

      {/* 테이블 헤더 */}
      <div className="border rounded-t-lg">
        <div className="flex items-center bg-gray-50 px-4 py-3 font-medium">
          <div className="w-12">
            <Checkbox
              checked={
                filteredAndSortedEvaluations.length > 0 &&
                selectedStudents.size === filteredAndSortedEvaluations.length
              }
              onCheckedChange={handleSelectAll}
            />
          </div>
          <div className="flex-1 grid grid-cols-6 gap-4">
            <div 
              className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('studentId')}
            >
              학번
              <SortIcon field="studentId" />
            </div>
            <div 
              className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('studentName')}
            >
              이름
              <SortIcon field="studentName" />
            </div>
            <div 
              className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('status')}
            >
              상태
              <SortIcon field="status" />
            </div>
            <div>점수</div>
            <div 
              className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('evaluatedAt')}
            >
              평가 시간
              <SortIcon field="evaluatedAt" />
            </div>
            <div>액션</div>
          </div>
        </div>
      </div>

      {/* 가상화된 학생 목록 */}
      <div className="border-x border-b rounded-b-lg">
        {filteredAndSortedEvaluations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? '검색 결과가 없습니다.' : '평가 데이터가 없습니다.'}
          </div>
        ) : (
          <List
            height={600}
            itemCount={filteredAndSortedEvaluations.length}
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