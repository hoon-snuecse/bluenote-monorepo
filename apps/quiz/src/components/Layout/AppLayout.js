'use client'

import { Navigation } from '@/components/Navigation/Navigation'
import { usePathname } from 'next/navigation'

export function AppLayout({ children }) {
  const pathname = usePathname()
  
  // 로그인과 홈 페이지에서는 네비게이션바를 표시하지 않음
  const showNavigation = pathname !== '/' && !pathname.startsWith('/auth')
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Quiz 앱 네비게이션 - 로그인과 홈 페이지 제외 */}
      {showNavigation && <Navigation />}
      
      <main className={showNavigation ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  )
}