'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Save, Globe } from 'lucide-react'

const tabs = [
  {
    name: '퀴즈 생성',
    href: '/create',
    icon: FileText,
    description: 'AI로 새로운 퀴즈 만들기'
  },
  {
    name: '미리보기',
    href: '/my-quizzes',
    icon: Save,
    description: '선택한 문항 미리보기'
  },
  {
    name: '커뮤니티',
    href: '/community',
    icon: Globe,
    description: '공유된 퀴즈 탐색'
  }
]

export function TabNavigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Kahoot 퀴즈 메이커
              </h1>
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
                      inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium
                      ${isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
          
          {/* 모바일 메뉴는 나중에 구현 */}
        </div>
      </div>
    </nav>
  )
}