'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { Assignment } from '@/types'

interface AssignmentSelectorProps {
  assignments: Assignment[]
  selectedAssignmentId: string
  onAssignmentChange: (id: string) => void
  loading: boolean
}

export function AssignmentSelector({
  assignments,
  selectedAssignmentId,
  onAssignmentChange,
  loading
}: AssignmentSelectorProps) {
  return (
    <Select value={selectedAssignmentId} onValueChange={onAssignmentChange}>
      <SelectTrigger className="w-64">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>과제 불러오는 중...</span>
          </div>
        ) : (
          <SelectValue placeholder="과제를 선택하세요" />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">전체 과제</SelectItem>
        {assignments && assignments.length > 0 ? assignments.map((assignment) => (
          <SelectItem key={assignment.id} value={assignment.id}>
            {assignment.title}
          </SelectItem>
        )) : null}
      </SelectContent>
    </Select>
  )
}