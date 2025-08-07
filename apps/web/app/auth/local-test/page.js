'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@bluenote/supabase-auth/client';

export default function LocalTestPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    setUser(user);
    setLoading(false);
  };

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        skipBrowserRedirect: false // 브라우저가 자동으로 리다이렉트
      }
    });

    if (error) {
      console.error('Error:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">로컬 인증 테스트</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>현재 URL: {typeof window !== 'undefined' ? window.location.origin : ''}</p>
        <p>사용자: {user ? user.email : '로그인되지 않음'}</p>
      </div>

      {user ? (
        <div>
          <p className="mb-4">로그인됨: {user.email}</p>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Google로 로그인
        </button>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">쿠키 확인</h2>
        <pre className="p-4 bg-gray-100 rounded text-xs">
          {typeof document !== 'undefined' ? document.cookie : ''}
        </pre>
      </div>
    </div>
  );
}