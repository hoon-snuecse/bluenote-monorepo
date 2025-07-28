'use client';

import dynamic from 'next/dynamic';

const NavigationWithAuth = dynamic(() => import('./NavigationWithAuth'), {
  ssr: false,
  loading: () => (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
              ♭
            </div>
            <span className="hidden sm:block font-display text-xl text-slate-800 tracking-tight">
              BlueNote
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
});

export default function NavigationWrapper() {
  return <NavigationWithAuth />;
}