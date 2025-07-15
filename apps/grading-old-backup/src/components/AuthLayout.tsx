'use client';

import { Navigation } from './Navigation';
import { useUser } from '@/contexts/UserContext';
import { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  const { loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}