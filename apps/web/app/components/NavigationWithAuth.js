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

export default function NavigationWithAuth() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // 세션 확인
  useEffect(() => {
    fetch('/api/auth/session-check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.session) {
          setSession(data.session);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
      href: '/', 
      label: '홈', 
      icon: Home,
    },
    { 
      href: '/activities', 
      label: '활동', 
      icon: FlaskConical,
    },
    { 
      href: '/research', 
      label: '연구', 
      icon: Microscope,
    },
    { 
      href: '/teaching', 
      label: '교육', 
      icon: BookOpen,
    },
    { 
      href: '/analytics', 
      label: '분석', 
      icon: BarChart3,
    },
    { 
      href: '/prg', 
      label: '프로그램', 
      icon: Laptop,
    },
    { 
      href: '/shed', 
      label: '일상', 
      icon: Hammer,
    },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/signout?callbackUrl=/';
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
            href="/" 
            className="group"
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
              return (
                <Link
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
                </Link>
              );
            })}
            
            {/* Claude AI 채팅 버튼 (로그인한 경우만) */}
            {session && (
              <Link
                href="/ai/chat"
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive('/ai/chat')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span>.AI.</span>
              </Link>
            )}
            
            {/* 관리자 대시보드 버튼 (관리자만) */}
            {session?.user?.isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive('/admin')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-900 hover:bg-slate-100 hover:text-black'
                }`}
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>관리자</span>
              </Link>
            )}
            
            {/* 로그인/로그아웃 버튼 */}
            <div className="ml-4">
              {loading ? (
                <div className="px-4 py-2 text-sm text-slate-500">...</div>
              ) : session ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/status"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 whitespace-nowrap"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">{session.user?.name || session.user?.email}</span>
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
                <Link
                  href="/auth/signin"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>로그인</span>
                </Link>
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
              return (
                <Link
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
                </Link>
              );
            })}
            
            {/* 모바일 Claude 채팅 버튼 */}
            {session && (
              <Link
                href="/ai/chat"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors whitespace-nowrap ${
                  isActive('/ai/chat')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>.AI.</span>
              </Link>
            )}
            
            {/* 모바일 관리자 버튼 */}
            {session?.user?.isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors whitespace-nowrap ${
                  isActive('/admin')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span>관리자</span>
              </Link>
            )}
            
            {/* 모바일 로그인/로그아웃 */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              {session ? (
                <>
                  <Link
                    href="/auth/status"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span>{session.user?.name || session.user?.email}</span>
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
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Google로 로그인</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}