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
    name: '퀴즈 저장',
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
  const [signOut, setSignOut] = useState(null)
  
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      // 동적 import로 next-auth/react 가져오기
      import('next-auth/react').then(({ getSession, signOut: nextAuthSignOut }) => {
        setSignOut(() => nextAuthSignOut)
        getSession().then(session => {
          if (session?.user?.email) {
            setUserEmail(session.user.email)
          }
          setLoading(false)
        }).catch(() => {
          setLoading(false)
        })
      })
    }
  }, [])
  
  const handleSignOut = async () => {
    if (signOut) {
      await signOut({ callbackUrl: '/' })
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
    console.log('[TabNavigation] mounted, pathname:', pathname)
  }, [pathname])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-gray-300 bg-white shadow-md">
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