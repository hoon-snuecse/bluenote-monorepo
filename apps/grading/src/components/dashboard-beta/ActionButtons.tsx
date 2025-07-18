'use client'

import { Button } from '@bluenote/ui'
import { Plus, Download, RefreshCw, FileText, Users, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
// Temporarily removed dropdown menu import

interface ActionButtonsProps {
  selectedAssignmentId: string
  onRefresh: () => void
}

export function ActionButtons({ selectedAssignmentId, onRefresh }: ActionButtonsProps) {
  const router = useRouter()

  const handleCreateAssignment = () => {
    router.push('/assignments/new')
  }

  const handleImportStudents = () => {
    if (selectedAssignmentId === 'all') {
      alert('특정 과제를 선택해주세요.')
      return
    }
    router.push(`/assignments/${selectedAssignmentId}/collect`)
  }

  const handleEvaluate = () => {
    if (selectedAssignmentId === 'all') {
      alert('특정 과제를 선택해주세요.')
      return
    }
    router.push(`/assignments/${selectedAssignmentId}/evaluate`)
  }

  const handleManageTemplates = () => {
    router.push('/templates')
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* 과제 만들기 */}
      <Button onClick={handleCreateAssignment} className="gap-2">
        <Plus className="h-4 w-4" />
        과제 만들기
      </Button>

      {/* 학생 글 가져오기 */}
      <Button 
        onClick={handleImportStudents} 
        variant="outline" 
        className="gap-2"
        disabled={selectedAssignmentId === 'all'}
      >
        <Users className="h-4 w-4" />
        학생 글 가져오기
      </Button>

      {/* 평가하기 */}
      <Button 
        onClick={handleEvaluate}
        variant="outline" 
        className="gap-2"
        disabled={selectedAssignmentId === 'all'}
      >
        <FileText className="h-4 w-4" />
        평가하기
      </Button>

      {/* 템플릿 관리 */}
      <Button 
        onClick={handleManageTemplates}
        variant="outline" 
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        템플릿 관리
      </Button>

      {/* 학생 그룹 관리 */}
      <Button 
        onClick={() => router.push('/students')}
        variant="outline" 
        className="gap-2"
      >
        <Users className="h-4 w-4" />
        학생 관리
      </Button>

      {/* 새로고침 */}
      <Button 
        onClick={onRefresh} 
        variant="outline" 
        size="icon"
        className="ml-auto"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  )
}