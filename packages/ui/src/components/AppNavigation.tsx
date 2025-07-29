'use client'

import React, { useState } from 'react'
import { ChevronDown, Home, GraduationCap, Brain, Menu, X } from 'lucide-react'

export interface AppNavigationProps {
  currentApp: 'web' | 'grading' | 'quiz'
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  onSignOut?: () => void
}

const getAppUrl = (appId: string) => {
  // 클라이언트 사이드에서 환경 확인
  const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('bluenote.site');
  
  const urls = {
    web: isProduction ? 'https://bluenote.site' : 'http://localhost:3000',
    grading: isProduction ? 'https://grading.bluenote.site' : 'http://localhost:3002',
    quiz: isProduction ? 'https://quiz.bluenote.site' : 'http://localhost:3003'
  };
  
  return urls[appId as keyof typeof urls];
};

const apps = [
  {
    id: 'web',
    name: 'Bluenote',
    description: '교육 콘텐츠 관리',
    icon: Home,
    color: 'bg-blue-500'
  },
  {
    id: 'grading',
    name: '글쓰기 평가',
    description: 'AI 평가 시스템',
    icon: GraduationCap,
    color: 'bg-green-500'
  },
  {
    id: 'quiz',
    name: '퀴즈 메이커',
    description: 'Kahoot 퀴즈 생성',
    icon: Brain,
    color: 'bg-purple-500'
  }
]

export function AppNavigation({ currentApp, user, onSignOut }: AppNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const currentAppInfo = apps.find(app => app.id === currentApp)
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 왼쪽: 앱 전환 드롭다운 */}
          <div className="flex items-center">
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            {/* 앱 전환 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {currentAppInfo && (
                  <>
                    <div className={`p-2 rounded-lg ${currentAppInfo.color}`}>
                      <currentAppInfo.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">{currentAppInfo.name}</div>
                      <div className="text-xs text-gray-500">{currentAppInfo.description}</div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
              
              {/* 드롭다운 메뉴 */}
              {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {apps.map((app) => (
                      <a
                        key={app.id}
                        href={getAppUrl(app.id)}
                        className={`flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          app.id === currentApp ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${app.color}`}>
                          <app.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{app.name}</div>
                          <div className="text-xs text-gray-500">{app.description}</div>
                        </div>
                        {app.id === currentApp && (
                          <div className="text-xs text-gray-400">현재 앱</div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 오른쪽: 사용자 정보 */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name || '사용자'}
                  className="h-8 w-8 rounded-full"
                />
              )}
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="hidden sm:block text-sm text-gray-500 hover:text-gray-700"
                >
                  로그아웃
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {apps.map((app) => (
              <a
                key={app.id}
                href={getAppUrl(app.id)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                  app.id === currentApp
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <app.icon className="h-5 w-5" />
                <span>{app.name}</span>
              </a>
            ))}
          </div>
          {user && onSignOut && (
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex items-center space-x-3">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name || '사용자'}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="mt-3 w-full text-left text-sm text-gray-500 hover:text-gray-700"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 드롭다운 오버레이 (클릭시 닫기) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}