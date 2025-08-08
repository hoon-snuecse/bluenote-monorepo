'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { useSupabaseAuth } from '@bluenote/supabase-auth';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNoteDropdownOpen, setIsNoteDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const { session, loading, signOut } = useSupabaseAuth();
  const user = session?.user;

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNoteDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 노트 섹션 서브메뉴
  const noteSubItems = [
    { href: '/research', label: '연구' },
    { href: '/teaching', label: '교육' },
    { href: '/analytics', label: '분석' },
    { href: '/shed', label: '일상' }
  ];

  // 메인 메뉴 아이템 (간소화)
  const mainMenuItems = [
    { href: '/', label: '홈' },
    { href: '/activities', label: '활동' },
    { 
      href: '#', 
      label: '노트',
      hasDropdown: true,
      subItems: noteSubItems
    },
    { href: '/prg', label: '프로그램' }
  ];

  // 노트 섹션 경로 체크
  const isNoteSection = noteSubItems.some(item => pathname.startsWith(item.href));

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    if (href === '#') return isNoteSection; // 노트 메뉴 활성화 체크
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm'
      } border-b border-slate-200`}>
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            {/* 로고/브랜드 */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-shadow">
                ♭
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-slate-900">
                  BlueNote Atelier
                </h1>
              </div>
            </Link>

            {/* 데스크톱 메뉴 */}
            <div className="hidden lg:flex items-center gap-1">
              {mainMenuItems.map((item) => {
                if (item.hasDropdown) {
                  return (
                    <div key={item.label} className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsNoteDropdownOpen(!isNoteDropdownOpen)}
                        onMouseEnter={() => setIsNoteDropdownOpen(true)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                        aria-expanded={isNoteDropdownOpen}
                        aria-haspopup="true"
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isNoteDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* 드롭다운 메뉴 */}
                      {isNoteDropdownOpen && (
                        <div 
                          className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1"
                          onMouseLeave={() => setIsNoteDropdownOpen(false)}
                        >
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setIsNoteDropdownOpen(false)}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                pathname.startsWith(subItem.href)
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              {/* AI 버튼 (로그인한 경우만) */}
              {user && (
                <Link
                  href="/ai/chat"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname.startsWith('/ai')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  AI
                </Link>
              )}
              
              {/* 관리자 버튼 (관리자만) */}
              {user?.isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname.startsWith('/admin')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  관리자
                </Link>
              )}
              
              {/* 로그인/로그아웃 버튼 */}
              <div className="ml-4 flex items-center gap-2">
                {!loading && user && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="w-4 h-4" />
                      <span className="max-w-[150px] truncate">{user.email}</span>
                    </div>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>로그아웃</span>
                    </button>
                  </>
                )}
                {!loading && !user && (
                  <Link
                    href="/auth/signin"
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
              className="lg:hidden flex items-center px-3 py-2 border border-slate-300 rounded-md text-slate-600 hover:text-slate-800 hover:border-slate-400 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm">
            <div className="container-custom py-4">
              {mainMenuItems.map((item) => {
                if (item.hasDropdown) {
                  return (
                    <div key={item.label}>
                      <div className="px-4 py-3 text-base font-medium text-slate-800">
                        {item.label}
                      </div>
                      <div className="pl-8">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              pathname.startsWith(subItem.href)
                                ? 'text-blue-700 font-medium'
                                : 'text-slate-600'
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              {/* 모바일 AI 버튼 */}
              {user && (
                <Link
                  href="/ai/chat"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    pathname.startsWith('/ai')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  AI
                </Link>
              )}
              
              {/* 모바일 관리자 버튼 */}
              {user?.isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    pathname.startsWith('/admin')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  관리자
                </Link>
              )}
              
              {/* 모바일 로그인/로그아웃 */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 text-slate-700">
                      <User className="w-5 h-5" />
                      <span>{user.email}</span>
                    </div>
                    <button
                      onClick={async () => {
                        await signOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-slate-600 hover:bg-slate-50 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Google로 로그인</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 서브 네비게이션 (노트 섹션에서만 표시) */}
      {isNoteSection && (
        <div className="sticky top-16 z-40 bg-gray-50 border-b border-gray-200">
          <div className="container-custom">
            <div className="flex items-center gap-2 h-12 overflow-x-auto">
              {noteSubItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    pathname.startsWith(item.href)
                      ? 'text-blue-700 border-b-2 border-blue-700'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}