'use client'

import MainNavigation from '@/components/Navigation/MainNavigation'
import { TabNavigation } from '@/components/Navigation/TabNavigation'
import { usePathname } from 'next/navigation'

export function AppLayout({ children }) {
  const pathname = usePathname()
  
  // 홈페이지와 인증 페이지에서는 탭 네비게이션바를 표시하지 않음
  const showTabNavigation = pathname !== '/' && !pathname.startsWith('/auth')
  
  console.log('[AppLayout] pathname:', pathname, 'showTabNavigation:', showTabNavigation)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 사이트 네비게이션 - 항상 표시 */}
      <MainNavigation />
      
      {/* Quiz 앱 네비게이션 - 홈페이지와 인증 페이지 제외 */}
      {showTabNavigation && (
        <div className="mt-16">
          <TabNavigation />
        </div>
      )}
      
      <main className={showTabNavigation ? "pt-32" : "pt-16"}>
        {children}
      </main>
    </div>
  )
}