'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@bluenote/supabase-auth/client';

export default function SignOutPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const signOut = async () => {
      await supabase.auth.signOut();
      router.push('/');
    };
    
    signOut();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">로그아웃 중...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}