'use client'

import { TabNavigation } from '@/components/Navigation/TabNavigation'
import { usePathname } from 'next/navigation'

export function AppLayout({ children }) {
  const pathname = usePathname()
  
  // 홈페이지에서는 네비게이션바를 표시하지 않음
  const showNavigation = pathname !== '/'
  
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && <TabNavigation />}
      <main className={showNavigation ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  )
}