'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolName?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 정보 조회
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 시 사용자 정보 조회
  useEffect(() => {
    fetchUser();
  }, []);

  // 로그인
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        router.push('/assignments');
      } else {
        setError(data.error || '로그인에 실패했습니다.');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}