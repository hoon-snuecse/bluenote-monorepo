'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export default function LoginPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [envStatus, setEnvStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 이미 로그인된 경우 홈으로 리다이렉트
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    fetch('/api/env-check')
      .then(res => res.json())
      .then(data => {
        setEnvStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to check environment:', err);
        setLoading(false);
      });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            BlueNote Atelier에 로그인하세요
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Google로 로그인
          </button>
        </div>

        {/* 환경 변수 상태 표시 (개발용) */}
        {!loading && envStatus && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-2">환경 설정 상태</h3>
            <div className="space-y-1 text-xs">
              <div className={`flex justify-between ${envStatus.authConfigured ? 'text-green-600' : 'text-red-600'}`}>
                <span>NextAuth 설정:</span>
                <span>{envStatus.authConfigured ? '✓' : '✗'}</span>
              </div>
              <div className={`flex justify-between ${envStatus.supabaseConfigured ? 'text-green-600' : 'text-red-600'}`}>
                <span>Supabase 설정:</span>
                <span>{envStatus.supabaseConfigured ? '✓' : '✗'}</span>
              </div>
              <div className={`flex justify-between ${envStatus.googleAuthConfigured ? 'text-green-600' : 'text-red-600'}`}>
                <span>Google OAuth 설정:</span>
                <span>{envStatus.googleAuthConfigured ? '✓' : '✗'}</span>
              </div>
            </div>
            
            {envStatus.safeValues.NEXTAUTH_URL && (
              <div className="mt-2 text-xs text-gray-600">
                <p>NextAuth URL: {envStatus.safeValues.NEXTAUTH_URL}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}