'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
import { useUser } from '@/contexts/UserContext';

export default function NavigationWithAuth() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading, logout } = useUser();
  const pathname = usePathname();

  // 제출 페이지에서는 네비게이션 바를 숨김
  if (pathname?.startsWith('/submit') || pathname?.startsWith('/public-submissions')) {
    return null;
  }

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
      href: 'https://bluenote.site', 
      label: '홈', 
      icon: Home,
      external: true
    },
    { 
      href: 'https://bluenote.site/activities', 
      label: '활동', 
      icon: FlaskConical,
      external: true
    },
    { 
      href: 'https://bluenote.site/research', 
      label: '연구', 
      icon: Microscope,
      external: true
    },
    { 
      href: 'https://bluenote.site/teaching', 
      label: '교육', 
      icon: BookOpen,
      external: true
    },
    { 
      href: 'https://bluenote.site/analytics', 
      label: '분석', 
      icon: BarChart3,
      external: true
    },
    { 
      href: 'https://bluenote.site/prg', 
      label: '프로그램', 
      icon: Laptop,
      external: true
    },
    { 
      href: 'https://bluenote.site/shed', 
      label: '일상', 
      icon: Hammer,
      external: true
    },
  ];

  const isActive = (item: any) => {
    // 프로그램 메뉴는 grading 사이트에서 항상 활성화
    if (item.href === 'https://bluenote.site/prg') return true;
    return false;
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, item: any) => {
    if (item.external) {
      e.preventDefault();
      window.location.href = item.href;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass shadow-lg' 
        : 'bg-white/80 backdrop-blur-sm'
    } border-b border-slate-200`}>
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* 로고/브랜드 */}
          <Link 
            href="https://bluenote.site" 
            className="group"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = 'https://bluenote.site';
            }}
            title="BlueNote Atelier"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              ♭
            </div>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Claude AI 채팅 버튼 (로그인한 경우만) */}
            {user && (
              <Link
                href="https://bluenote.site/ai/chat"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = 'https://bluenote.site/ai/chat';
                }}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  false
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span className="font-bold">.AI.</span>
              </Link>
            )}
            
            {/* 관리자 대시보드 버튼 (관리자만) */}
            {user?.role === 'admin' && (
              <Link
                href="https://bluenote.site/admin"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = 'https://bluenote.site/admin';
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap text-slate-900 hover:bg-slate-100 hover:text-black"
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>관리자</span>
              </Link>
            )}
            
            {/* 로그인/로그아웃 버튼 */}
            <div className="ml-4">
              {loading ? (
                <div className="px-4 py-2 text-sm text-slate-500">...</div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/status"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 whitespace-nowrap"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">{user.name || user.email}</span>
                  </Link>
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
                  onClick={() => {
                    window.location.href = 'https://bluenote.site'
                  }}
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
          <div className="container-custom py-4">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    handleNavigation(e, item);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* 모바일 Claude 채팅 버튼 */}
            {user && (
              <Link
                href="https://bluenote.site/ai/chat"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = 'https://bluenote.site/ai/chat';
                  setIsMenuOpen(false);
                }}
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors whitespace-nowrap ${
                  false
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="font-bold">.AI.</span>
              </Link>
            )}
            
            {/* 모바일 관리자 버튼 */}
            {user?.role === 'admin' && (
              <Link
                href="https://bluenote.site/admin"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = 'https://bluenote.site/admin';
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors whitespace-nowrap text-slate-900 hover:bg-slate-50"
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span>관리자</span>
              </Link>
            )}
            
            {/* 모바일 로그인/로그아웃 */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              {user ? (
                <>
                  <Link
                    href="/auth/status"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span>{user.name || user.email}</span>
                  </Link>
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
                    window.location.href = 'https://bluenote.site'
                    setIsMenuOpen(false)
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