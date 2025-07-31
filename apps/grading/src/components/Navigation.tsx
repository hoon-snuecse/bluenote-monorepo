'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { usePathname } from 'next/navigation';
import { LogOut, PenTool, User } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useUser();
  const pathname = usePathname();

  // 로그인이 필요없는 페이지에서는 네비게이션 숨김
  if (!user || ['/login', '/register', '/submit', '/view'].some(path => pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-gray-300 bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <div className="flex shrink-0 items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-gray-800">
                  글쓰기 평가 시스템
                </span>
              </Link>
            </div>
          </div>
          
          {/* 사용자 정보 및 로그아웃 버튼 */}
          <div className="flex items-center gap-4">
            {/* BlueNote로 돌아가기 링크 */}
            <a 
              href="https://www.bluenote.site/prg" 
              className="text-sm text-gray-600 hover:text-gray-800 underline"
              title="메인 사이트로 돌아가기"
            >
              ← BlueNote로 돌아가기
            </a>
            
            {/* 사용자 정보 */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            
            {/* 로그아웃 버튼 */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}