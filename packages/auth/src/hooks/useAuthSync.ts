'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface AuthSyncOptions {
  mainAuthUrl?: string;
  redirectOnFail?: boolean;
}

export function useAuthSync(options: AuthSyncOptions = {}) {
  const { 
    mainAuthUrl = process.env.NEXT_PUBLIC_MAIN_AUTH_URL || 'https://bluenote.site',
    redirectOnFail = true 
  } = options;
  
  const { data: localSession, status: localStatus } = useSession();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'failed'>('idle');
  const [mainSession, setMainSession] = useState<any>(null);

  useEffect(() => {
    if (localStatus === 'loading') return;

    const syncSession = async () => {
      setSyncStatus('syncing');
      
      try {
        // 메인 앱의 세션 정보 가져오기
        const response = await fetch(`${mainAuthUrl}/api/auth/session-info`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch main session');
        }

        const data = await response.json();
        
        if (data.authenticated && data.session) {
          setMainSession(data.session);
          
          // 로컬 세션이 없는데 메인 세션이 있는 경우
          if (!localSession) {
            // 자동으로 로그인 시도
            if (redirectOnFail) {
              // 메인 앱으로 리다이렉트하여 로그인
              window.location.href = `${mainAuthUrl}/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`;
            }
          }
          
          setSyncStatus('synced');
        } else {
          // 메인 세션이 없는 경우
          if (localSession) {
            // 로컬 세션은 있는데 메인 세션이 없으면 로컬 세션도 무효화
            window.location.href = '/api/auth/signout';
          }
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error('Session sync error:', error);
        setSyncStatus('failed');
      }
    };

    // 초기 동기화
    syncSession();

    // 주기적으로 동기화 (5분마다)
    const interval = setInterval(syncSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [localSession, localStatus, mainAuthUrl, redirectOnFail]);

  return {
    localSession,
    mainSession,
    syncStatus,
    isAuthenticated: !!localSession && !!mainSession,
    isLoading: localStatus === 'loading' || syncStatus === 'syncing',
  };
}