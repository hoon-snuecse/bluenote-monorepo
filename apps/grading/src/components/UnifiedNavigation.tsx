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

export default function UnifiedNavigation() {
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

  const isActive = (item) => {
    if (item.isActive) return true;
    return false;
  };

  const handleNavigation = (e, item) => {
    if (item.external) {
      e.preventDefault();
      window.location.href = item.href;
    }
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass shadow-lg' 
        : 'bg-white/60 backdrop-blur-sm'
    } border-b border-slate-200/50`}>
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="https://bluenote.site" 
            className="flex items-center space-x-3 group"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = 'https://bluenote.site';
            }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-xl transform transition-all duration-300 group-hover:scale-110">
              ♭
            </div>
            <span className="hidden md:block font-semibold text-slate-800 text-lg">
              BlueNote <span className="font-light text-slate-600">Atelier</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 hover:shadow-sm'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-200"
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
        <div className="md:hidden glass border-t border-slate-200/50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    handleNavigation(e, item);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}