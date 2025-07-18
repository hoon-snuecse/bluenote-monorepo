import dynamic from 'next/dynamic'
import { Skeleton } from '@bluenote/ui'

// 로딩 컴포넌트
const ChartLoader = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-64 w-full" />
  </div>
)

const GridLoader = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
)

// 동적 임포트로 번들 크기 최적화
export const DynamicEvaluationCharts = dynamic(
  () => import('./EvaluationCharts').then(mod => mod.EvaluationCharts),
  { 
    loading: () => <ChartLoader />,
    ssr: false // 클라이언트 사이드에서만 렌더링
  }
)

export const DynamicAdvancedAnalytics = dynamic(
  () => import('./AdvancedAnalytics').then(mod => mod.AdvancedAnalytics),
  { 
    loading: () => <ChartLoader />,
    ssr: false
  }
)

export const DynamicStudentGrid = dynamic(
  () => import('./VirtualizedStudentGrid').then(mod => mod.VirtualizedStudentGrid),
  { 
    loading: () => <GridLoader />,
    ssr: true // 서버 사이드 렌더링 유지
  }
)

export const DynamicReportGenerator = dynamic(
  () => import('./ReportGenerator').then(mod => mod.ReportGenerator),
  { 
    loading: () => <ChartLoader />,
    ssr: true
  }
)