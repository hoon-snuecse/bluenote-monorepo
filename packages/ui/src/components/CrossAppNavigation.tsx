'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Home, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  MessageSquare,
  Users,
  Settings,
  ExternalLink
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  external?: boolean
  requiresAuth?: boolean
  requiresPermission?: 'admin' | 'write' | 'grade'
}

interface CrossAppNavigationProps {
  currentApp: 'web' | 'grading'
  userPermissions?: {
    isAdmin?: boolean
    canWrite?: boolean
    canGrade?: boolean
  }
}

const webNavItems: NavItem[] = [
  { name: '홈', href: '/', icon: Home },
  { name: '연구', href: '/research', icon: FileText },
  { name: '교육', href: '/teaching', icon: GraduationCap },
  { name: '분석', href: '/analytics', icon: BarChart3 },
  { name: 'AI 채팅', href: '/ai/chat', icon: MessageSquare, requiresAuth: true },
  { name: '관리자', href: '/admin/dashboard', icon: Settings, requiresPermission: 'admin' },
]

const gradingNavItems: NavItem[] = [
  { name: '대시보드', href: '/dashboard-beta', icon: Home },
  { name: '과제 관리', href: '/assignments', icon: FileText, requiresPermission: 'grade' },
  { name: '학생 관리', href: '/students', icon: Users, requiresPermission: 'grade' },
  { name: '평가', href: '/grading', icon: GraduationCap, requiresPermission: 'grade' },
  { name: '설정', href: '/settings', icon: Settings },
]

export function CrossAppNavigation({ currentApp, userPermissions = {} }: CrossAppNavigationProps) {
  const isWebApp = currentApp === 'web'
  const baseUrl = isWebApp ? '' : process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://bluenote.site'
  const gradingUrl = !isWebApp ? '' : process.env.NEXT_PUBLIC_GRADING_APP_URL || 'https://grading.bluenote.site'

  const checkPermission = (item: NavItem) => {
    if (!item.requiresPermission) return true
    if (item.requiresPermission === 'admin') return userPermissions.isAdmin
    if (item.requiresPermission === 'write') return userPermissions.canWrite
    if (item.requiresPermission === 'grade') return userPermissions.canGrade
    return false
  }

  const renderNavItem = (item: NavItem, isExternal: boolean = false) => {
    if (item.requiresAuth && !userPermissions) return null
    if (!checkPermission(item)) return null

    const Icon = item.icon
    const href = isExternal ? (isWebApp ? gradingUrl : baseUrl) + item.href : item.href

    if (isExternal || item.external) {
      return (
        <a
          key={item.name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Icon className="h-4 w-4" />
          <span>{item.name}</span>
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </a>
      )
    }

    return (
      <Link
        key={item.name}
        href={href}
        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Icon className="h-4 w-4" />
        <span>{item.name}</span>
      </Link>
    )
  }

  return (
    <nav className="space-y-6">
      {/* 현재 앱 네비게이션 */}
      <div>
        <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {isWebApp ? 'Bluenote' : 'Grading System'}
        </h3>
        <div className="space-y-1">
          {(isWebApp ? webNavItems : gradingNavItems).map(item => renderNavItem(item))}
        </div>
      </div>

      {/* 다른 앱으로 이동 */}
      <div>
        <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          다른 앱
        </h3>
        <div className="space-y-1">
          {isWebApp ? (
            <a
              href={gradingUrl}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <GraduationCap className="h-4 w-4" />
              <span>평가 시스템</span>
              <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
            </a>
          ) : (
            <a
              href={baseUrl}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>메인 사이트</span>
              <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}