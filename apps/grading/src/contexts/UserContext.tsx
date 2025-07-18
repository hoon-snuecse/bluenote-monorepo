'use client';

import { SessionProvider, useSession } from '@bluenote/auth';
import { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';

interface UserContextType {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: string;
    isAdmin?: boolean;
    canWrite?: boolean;
  } | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function UserProviderInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  
  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    isAdmin: session.user.isAdmin,
    canWrite: session.user.canWrite,
    canGrade: session.user.isAdmin || session.user.role === 'teacher',
  } : null;
  
  const loading = status === 'loading';
  
  // Google OAuth 로그인으로 변경
  const login = async (email: string, password: string) => {
    // 기존 로그인 방식은 더 이상 사용하지 않음
    // Google OAuth로 리다이렉트
    await signIn('google', { callbackUrl: '/dashboard-beta' });
  };
  
  const logout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };
  
  const refreshUser = async () => {
    // NextAuth의 update 함수를 사용하여 세션 갱신
    await update();
  };
  
  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error: null,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function UserProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserProviderInner>{children}</UserProviderInner>
    </SessionProvider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}