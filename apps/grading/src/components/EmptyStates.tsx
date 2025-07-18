'use client'

import { Card, CardContent } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { 
  FileText, 
  Users, 
  BarChart3, 
  FileSpreadsheet,
  Plus,
  Upload,
  Search,
  AlertCircle
} from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        {icon && (
          <div className="rounded-full bg-muted p-3 mb-4">
            {icon}
          </div>
        )}
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-sm">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// 과제가 없을 때
export function NoAssignments({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-muted-foreground" />}
      title="과제가 없습니다"
      description="첫 번째 과제를 만들어 학생들의 글쓰기를 평가해보세요."
      action={onCreateNew ? {
        label: "새 과제 만들기",
        onClick: onCreateNew
      } : undefined}
    />
  )
}

// 학생이 없을 때
export function NoStudents({ onImport }: { onImport?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="등록된 학생이 없습니다"
      description="CSV 파일을 업로드하여 학생 명단을 일괄 등록하세요."
      action={onImport ? {
        label: "학생 명단 업로드",
        onClick: onImport
      } : undefined}
    />
  )
}

// 평가 결과가 없을 때
export function NoEvaluations() {
  return (
    <EmptyState
      icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
      title="평가 결과가 없습니다"
      description="과제를 선택하고 학생들의 에세이를 평가해보세요."
    />
  )
}

// 보고서가 없을 때
export function NoReports() {
  return (
    <EmptyState
      icon={<FileSpreadsheet className="h-8 w-8 text-muted-foreground" />}
      title="생성된 보고서가 없습니다"
      description="평가를 완료한 후 보고서를 생성할 수 있습니다."
    />
  )
}

// 검색 결과가 없을 때
export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title="검색 결과가 없습니다"
      description={`"${query}"에 대한 검색 결과를 찾을 수 없습니다. 다른 검색어를 시도해보세요.`}
    />
  )
}

// 일반적인 에러 상태
export function ErrorState({ 
  message = "문제가 발생했습니다", 
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-8 w-8 text-destructive" />}
      title="오류가 발생했습니다"
      description={message}
      action={onRetry ? {
        label: "다시 시도",
        onClick: onRetry
      } : undefined}
    />
  )
}