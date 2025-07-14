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
  MessageCircle,
  Shield,
  Laptop
} from 'lucide-react';

export default function NavigationSimple() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

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
      href: '/shed', 
      label: '창고', 
      icon: Hammer,
    },
  ];

  const programMenuItems = [
    { 
      href: '/prg', 
      label: 'AI 프로그램', 
      icon: Laptop,
    },
    { 
      href: '/prg/grading', 
      label: '평가 시스템', 
      icon: Shield,
    },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className={`text-xl font-space-grotesk font-bold transition-colors ${
              isScrolled ? 'text-slate-900' : 'text-slate-800'
            }`}>
              BlueNote Atelier
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : isScrolled 
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side menu */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Program Menu */}
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
              {programMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Login Button (temporary placeholder) */}
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              로그인
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-md transition-colors ${
              isScrolled 
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-700 hover:bg-white/50'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="container-custom px-4 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="space-y-2">
                {programMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-all ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all"
              >
                <LogIn className="w-5 h-5" />
                로그인
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}