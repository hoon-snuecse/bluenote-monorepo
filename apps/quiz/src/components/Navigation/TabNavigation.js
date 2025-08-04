'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Save, Globe, User, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

const tabs = [
  {
    name: '퀴즈 생성',
    href: '/create',
    icon: FileText,
    description: 'AI로 새로운 퀴즈 만들기'
  },
  {
    name: '퀴즈 편집',
    href: '/saved',
    icon: Save,
    description: '내 퀴즈 관리하기'
  },
  {
    name: '커뮤니티',
    href: '/community',
    icon: Globe,
    description: '공유된 퀴즈 탐색'
  }
]

function UserInfo() {
  const [userEmail, setUserEmail] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // 세션 정보 가져오기
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        if (data.user?.email) {
          setUserEmail(data.user.email)
        }
      } catch (error) {
        console.error('Failed to fetch session:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSession()
  }, [])
  
  const handleSignOut = async () => {
    try {
      // 1. Quiz 앱 세션 삭제
      await fetch('/api/auth/sync', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      // 2. 메인 사이트로 이동하여 로그아웃
      window.location.href = 'https://www.bluenote.site/api/auth/signout?callbackUrl=https://quiz.bluenote.site/'
    } catch (error) {
      // 에러 발생 시에도 메인 사이트로 이동
      window.location.href = 'https://www.bluenote.site/api/auth/signout?callbackUrl=https://quiz.bluenote.site/'
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse" />
        <div className="w-24 h-4 bg-gray-300 rounded animate-pulse" />
      </div>
    )
  }
  
  if (!userEmail) {
    return null
  }
  
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <User className="w-4 h-4" />
        <span>{userEmail}</span>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        title="로그아웃"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">로그아웃</span>
      </button>
    </div>
  )
}

export function TabNavigation() {
  const pathname = usePathname()
  
  useEffect(() => {
  }, [pathname])

  return (
    <nav className="fixed top-16 left-0 right-0 z-40 border-b-2 border-gray-300 bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <div className="flex shrink-0 items-center">
              <Link href="/community" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                  K
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Kahoot 퀴즈 메이커
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = pathname.startsWith(tab.href)
                
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`
                      inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-all
                      ${isActive
                        ? 'border-blue-600 text-blue-600 font-semibold'
                        : 'border-transparent text-gray-600 hover:border-gray-400 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.name}
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* 사용자 정보 표시 */}
          <UserInfo />
        </div>
      </div>
    </nav>
  )
}