'use client';

import { useSupabaseAuth } from '@bluenote/supabase-auth';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { session, loading } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (loading) return; // Still loading
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return <>{children}</>;
}