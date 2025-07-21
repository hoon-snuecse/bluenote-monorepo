'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    // 메인 사이트로 리다이렉트 (통합 로그인 사용)
    window.location.href = 'https://bluenote.site'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">메인 사이트로 이동 중...</p>
      </div>
    </div>
  )
}