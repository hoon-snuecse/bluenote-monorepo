'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearCookiesPage() {
  const router = useRouter()

  useEffect(() => {
    // NextAuth 관련 쿠키 제거
    const cookiesToClear = [
      'next-auth.callback-url',
      'next-auth.csrf-token',
      'next-auth.session-token',
      '__Secure-next-auth.callback-url',
      '__Secure-next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token'
    ]

    // 각 쿠키를 다양한 도메인 설정으로 제거 시도
    cookiesToClear.forEach(name => {
      // 현재 도메인
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      // quiz.bluenote.site
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=quiz.bluenote.site;`
      // .bluenote.site
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.bluenote.site;`
      // bluenote.site
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=bluenote.site;`
    })

    // localStorage 정리
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('next-auth') || key.includes('auth-token'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // sessionStorage 정리
    const sessionKeysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('next-auth') || key.includes('auth-token'))) {
        sessionKeysToRemove.push(key)
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

    // 3초 후 로그인 페이지로 리다이렉트
    setTimeout(() => {
      router.push('/auth/signin')
    }, 3000)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">쿠키 정리 중...</h1>
        <p className="text-gray-600 mb-4">NextAuth 쿠키를 제거하고 있습니다.</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500">잠시 후 로그인 페이지로 이동합니다.</p>
      </div>
    </div>
  )
}