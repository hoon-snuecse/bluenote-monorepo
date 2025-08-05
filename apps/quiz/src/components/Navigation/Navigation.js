'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Save, Globe, User, LogOut } from 'lucide-react'
import { useSupabaseAuth } from '@bluenote/supabase-auth'

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

export function Navigation() {
  const pathname = usePathname()
  const { user, loading, signOut } = useSupabaseAuth()
  
  const handleSignOut = async () => {
    // Supabase Auth signOut 사용
    await signOut()
  }

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
          
          {/* 사용자 정보 및 로그아웃 버튼 */}
          <div className="flex items-center gap-4">
            {!loading && user && (
              <>
                {/* 사용자 정보 */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                
                {/* 로그아웃 버튼 */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}