'use client';

import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

export function DevAutoLogin() {
  const { user, refreshUser } = useUser();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !user) {
      // 개발 모드에서 자동 로그인
      fetch('/api/auth/dev-login')
        .then(() => refreshUser())
        .catch(console.error);
    }
  }, [user, refreshUser]);

  return null;
}