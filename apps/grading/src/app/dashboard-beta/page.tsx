import { Metadata } from 'next'
import { UnifiedDashboard } from '@/components/dashboard-beta/UnifiedDashboard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: '통합 평가 대시보드 (Beta)',
  description: '과제 관리, 평가 실행, 결과 분석을 한 곳에서',
}

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function DashboardBetaPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardLoading />}>
        <UnifiedDashboard />
      </Suspense>
    </ErrorBoundary>
  )
}