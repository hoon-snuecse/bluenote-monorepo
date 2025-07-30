'use client'

import { TabNavigation } from '@/components/Navigation/TabNavigation'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function QuizLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // 세션 확인
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (!data || !data.user) {
          // 현재 경로를 콜백 URL로 포함
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        }
        setIsChecking(false)
      })
      .catch(() => {
        router.push('/auth/signin')
        setIsChecking(false)
      })
  }, [router, pathname])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <TabNavigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}