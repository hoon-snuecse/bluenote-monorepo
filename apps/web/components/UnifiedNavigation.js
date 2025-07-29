'use client'

import { AppNavigation } from '@bluenote/ui'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function UnifiedNavigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  // 인증 페이지에서는 네비게이션 숨김
  if (pathname.startsWith('/auth/')) {
    return null
  }
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }
  
  return (
    <>
      <AppNavigation
        currentApp="web"
        user={session?.user}
        onSignOut={handleSignOut}
      />
      {/* 네비게이션 높이만큼 여백 추가 */}
      <div className="h-16" />
    </>
  )
}