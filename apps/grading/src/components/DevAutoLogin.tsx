'use client';

import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

export function DevAutoLogin() {
  const { user, refreshUser } = useUser();

  useEffect(() => {
    // 개발 환경에서만 작동 (localhost 체크)
    const isDevelopment = typeof window !== 'undefined' && 
                         (window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1');
    
    if (isDevelopment && !user) {
      // 개발 모드에서 자동 로그인
      fetch('/api/auth/dev-login')
        .then(() => refreshUser())
        .catch(console.error);
    }
  }, [user, refreshUser]);

  return null;
}