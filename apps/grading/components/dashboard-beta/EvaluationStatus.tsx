'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface EvaluationStatusProps {
  stats: {
    total: number
    completed: number
    pending: number
    completionRate: number
  } | null
  loading: boolean
}

export function EvaluationStatus({ stats, loading }: EvaluationStatusProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const data = stats || {
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 전체 학생 수 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            전체 학생
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.total}</p>
          <p className="text-xs text-muted-foreground">제출된 과제</p>
        </CardContent>
      </Card>

      {/* 평가 완료 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            평가 완료
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{data.completed}</p>
          <p className="text-xs text-muted-foreground">완료된 평가</p>
        </CardContent>
      </Card>

      {/* 미완료 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <XCircle className="h-4 w-4 text-orange-600" />
            미완료
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-orange-600">{data.pending}</p>
          <p className="text-xs text-muted-foreground">대기 중인 평가</p>
        </CardContent>
      </Card>

      {/* 완료율 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            완료율
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.completionRate.toFixed(1)}%</p>
          <Progress value={data.completionRate} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  )
}