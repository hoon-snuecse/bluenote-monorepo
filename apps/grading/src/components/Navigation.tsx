'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { usePathname } from 'next/navigation';
import { LogOut, FileText, ClipboardCheck, Settings, BarChart3 } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useUser();
  const pathname = usePathname();

  // 로그인이 필요없는 페이지에서는 네비게이션 숨김
  if (!user || ['/login', '/register', '/submit', '/view'].some(path => pathname.startsWith(path))) {
    return null;
  }

  const navItems = [
    { href: '/assignments', label: '과제 관리', icon: FileText },
    { href: '/grading', label: '평가 대시보드', icon: ClipboardCheck },
    { href: '/analytics', label: '통계 분석', icon: BarChart3 },
    { href: '/settings', label: '설정', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">AI 글쓰기 평가 시스템</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.name} ({user.schoolName || '학교 미등록'})
              </span>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}