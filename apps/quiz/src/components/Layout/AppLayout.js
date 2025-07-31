'use client'

import { TabNavigation } from '@/components/Navigation/TabNavigation'
import { usePathname } from 'next/navigation'

export function AppLayout({ children }) {
  const pathname = usePathname()
  
  // 홈페이지와 인증 페이지에서는 네비게이션바를 표시하지 않음
  const showNavigation = pathname !== '/' && !pathname.startsWith('/auth')
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Quiz 앱 네비게이션 - 홈페이지 제외 */}
      {showNavigation && <TabNavigation />}
      
      <main className={showNavigation ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  )
}