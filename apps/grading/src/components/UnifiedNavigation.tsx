'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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

export default function UnifiedNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useUser();

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
      external: true,
      isActive: true // 프로그램 메뉴는 항상 활성화
    },
    { 
      href: 'https://bluenote.site/shed', 
      label: '일상', 
      icon: Hammer,
      external: true
    },
  ];

  const isActive = (item: any) => {
    if (item.isActive) return true;
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
          {/* Logo */}
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

          {/* Desktop Menu */}
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
            
            {/* 사용자 메뉴 */}
            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                <span className="text-sm text-slate-600">
                  {user.name}
                </span>
                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                    title="관리자 대시보드"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-slate-800 transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>로그인</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* 모바일 사용자 메뉴 */}
            <div className="pt-3 mt-3 border-t border-slate-200">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-slate-600">
                    {user.name}
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5" />
                      <span>관리자 대시보드</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  <span>로그인</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}