'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@bluenote/auth';
import { 
  Home, 
  FlaskConical,
  Microscope, 
  BookOpen, 
  BarChart3,
  Hammer,
  Menu,
  X,
  LogIn,
  LogOut,
  MessageCircle,
  Shield,
  Laptop,
  User,
  History
} from 'lucide-react';

export default function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // useAuth 훅 사용 시도
  let user = null;
  let status = 'loading';
  
  try {
    const authData = useAuth();
    user = authData.user;
    status = authData.status;
  } catch (error) {
    console.error('[MainNavigation] useAuth error:', error);
  }
  
  const pathname = usePathname();
  
  useEffect(() => {
    console.log('[MainNavigation] Auth status:', status, 'User:', user);
  }, [status, user]);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { 
      href: 'https://www.bluenote.site/', 
      label: '홈', 
      icon: Home,
      isExternal: true
    },
    { 
      href: 'https://www.bluenote.site/activities', 
      label: '활동', 
      icon: FlaskConical,
      isExternal: true
    },
    { 
      href: 'https://www.bluenote.site/research', 
      label: '연구', 
      icon: Microscope,
      isExternal: true
    },
    { 
      href: 'https://www.bluenote.site/teaching', 
      label: '교육', 
      icon: BookOpen,
      isExternal: true
    },
    { 
      href: 'https://www.bluenote.site/analytics', 
      label: '분석', 
      icon: BarChart3,
      isExternal: true
    },
    { 
      href: 'https://www.bluenote.site/prg', 
      label: '프로그램', 
      icon: Laptop,
      isExternal: true
    },
    { 
      href: 'https://www.bluenote.site/shed', 
      label: '일상', 
      icon: Hammer,
      isExternal: true
    },
  ];

  const isActive = (href) => {
    // Quiz 앱에서는 모든 메뉴가 외부 링크이므로 활성화 표시하지 않음
    return false;
  };

  const handleLogout = () => {
    window.location.href = 'https://www.bluenote.site/api/auth/signout?callbackUrl=https://quiz.bluenote.site';
  };

  const handleLogin = () => {
    const currentPath = window.location.pathname;
    window.location.href = `https://www.bluenote.site/auth/signin?callbackUrl=${encodeURIComponent(`https://quiz.bluenote.site${currentPath}`)}`;
  };
  
  // 링크 클릭 핸들러 - 로그인 상태 확인
  const handleNavClick = (e, href) => {
    // 외부 링크이고 로그인되지 않은 경우 경고
    if (status === 'unauthenticated' && !href.includes('bluenote.site/')) {
      e.preventDefault();
      if (confirm('이 페이지를 보려면 로그인이 필요할 수 있습니다. 로그인하시겠습니까?')) {
        handleLogin();
      }
    }
    // 그 외의 경우는 정상적으로 이동
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-white/80 backdrop-blur-sm'
    } border-b border-slate-200`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고/브랜드 */}
          <a 
            href="https://www.bluenote.site" 
            className="group"
            title="BlueNote Atelier"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              ♭
            </div>
          </a>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            })}
            
            {/* Claude AI 채팅 버튼 (로그인한 경우만) */}
            {status === 'authenticated' && user && (
              <a
                href="https://www.bluenote.site/ai/chat"
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 whitespace-nowrap"
              >
                <span>.AI.</span>
              </a>
            )}
            
            {/* 관리자 대시보드 버튼 (관리자만) */}
            {status === 'authenticated' && user?.isAdmin && (
              <a
                href="https://www.bluenote.site/admin/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-100 hover:text-black transition-all duration-200 whitespace-nowrap"
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>관리자</span>
              </a>
            )}
            
            {/* 로그인/로그아웃 버튼 */}
            <div className="ml-4">
              {status === 'loading' ? (
                <div className="px-4 py-2 text-sm text-slate-500">...</div>
              ) : status === 'authenticated' && user ? (
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.bluenote.site/auth/status"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 whitespace-nowrap"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">{user.name || user.email}</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors whitespace-nowrap"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>로그인</span>
                </button>
              )}
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center px-3 py-2 border border-slate-300 rounded-md text-slate-600 hover:text-slate-800 hover:border-slate-400 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            })}
            
            {/* 모바일 Claude 채팅 버튼 */}
            {status === 'authenticated' && user && (
              <a
                href="https://www.bluenote.site/ai/chat"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                <span>.AI.</span>
              </a>
            )}
            
            {/* 모바일 관리자 버튼 */}
            {status === 'authenticated' && user?.isAdmin && (
              <a
                href="https://www.bluenote.site/admin/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span>관리자</span>
              </a>
            )}
            
            {/* 모바일 로그인/로그아웃 */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              {status === 'authenticated' && user ? (
                <>
                  <a
                    href="https://www.bluenote.site/auth/status"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span>{user.name || user.email}</span>
                  </a>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleLogin();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Google로 로그인</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}