import { Metadata } from 'next'
import { UnifiedDashboard } from '@/components/dashboard-beta/UnifiedDashboard'

export const metadata: Metadata = {
  title: '통합 평가 대시보드 (Beta)',
  description: '과제 관리, 평가 실행, 결과 분석을 한 곳에서',
}

export default function DashboardBetaPage() {
  return <UnifiedDashboard />
}