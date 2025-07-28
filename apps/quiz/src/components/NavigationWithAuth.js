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
      href: process.env.NODE_ENV === 'production' ? 'https://bluenote.site' : 'http://localhost:3000', 
      label: '홈', 
      icon: Home,
      external: true
    },
    { 
      href: process.env.NODE_ENV === 'production' ? 'https://bluenote.site/activities' : 'http://localhost:3000/activities', 
      label: '활동', 
      icon: FlaskConical,
      external: true
    },
    { 
      href: process.env.NODE_ENV === 'production' ? 'https://bluenote.site/research' : 'http://localhost:3000/research', 
      label: '연구', 
      icon: Microscope,
      external: true
    },
    { 
      href: process.env.NODE_ENV === 'production' ? 'https://bluenote.site/teaching' : 'http://localhost:3000/teaching', 
      label: '교육', 
      icon: BookOpen,
      external: true
    },
    { 
      href: process.env.NODE_ENV === 'production' ? 'https://bluenote.site/analytics' : 'http://localhost:3000/analytics', 
      label: '분석', 
      icon: BarChart3,
      external: true
    },
    { 
      href: process.env.NODE_ENV === 'production' ? 'https://bluenote.site/prg' : 'http://localhost:3000/prg', 
      label: '프로그램', 
      icon: Laptop,
      external: true
    },
  ];

  const isActive = (href) => {
    if (href.startsWith('http')) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/signout?callbackUrl=/';
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm' 
        : 'bg-white/80 backdrop-blur-sm border-b border-slate-200'
    }`}>
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href={process.env.NODE_ENV === 'production' ? 'https://bluenote.site' : 'http://localhost:3000'}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              ♭
            </div>
            <span className="hidden sm:block font-display text-xl text-slate-800 tracking-tight">
              BlueNote
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = isActive(item.href);
              
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      item.highlighted
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                        : isItemActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </a>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    item.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                      : isItemActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* AI Chat */}
            {session && (
              <Link
                href={process.env.NODE_ENV === 'production' ? 'https://bluenote.site/ai/chat' : 'http://localhost:3000/ai/chat'}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>AI Chat</span>
              </Link>
            )}
            
            {/* Admin */}
            {session?.user?.isAdmin && (
              <Link
                href={process.env.NODE_ENV === 'production' ? 'https://bluenote.site/admin' : 'http://localhost:3000/admin'}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>관리자</span>
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {session ? (
                  <div className="flex items-center space-x-4">
                    <span className="hidden sm:block text-sm text-slate-600">
                      {session.user.name || session.user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                      title="로그아웃"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="hidden sm:block">로그인</span>
                  </Link>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-slate-600 hover:text-slate-900 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isItemActive = isActive(item.href);
                
                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        item.highlighted
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : isItemActive
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      item.highlighted
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : isItemActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {session && (
                <>
                  <a
                    href={process.env.NODE_ENV === 'production' ? 'https://bluenote.site/ai/chat' : 'http://localhost:3000/ai/chat'}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>AI Chat</span>
                  </a>
                  
                  <a
                    href={process.env.NODE_ENV === 'production' ? 'https://bluenote.site/ai/chat-history' : 'http://localhost:3000/ai/chat-history'}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <History className="w-4 h-4" />
                    <span>대화 기록</span>
                  </a>
                </>
              )}
              
              {session?.user?.isAdmin && (
                <a
                  href={process.env.NODE_ENV === 'production' ? 'https://bluenote.site/admin' : 'http://localhost:3000/admin'}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  <span>관리자</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}