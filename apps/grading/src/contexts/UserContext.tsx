'use client';

import { useSupabaseAuth, createClient } from '@bluenote/supabase-auth';
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserContextType {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: string;
    isAdmin?: boolean;
    canWrite?: boolean;
    canGrade?: boolean;
  } | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, loading: authLoading } = useSupabaseAuth();
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  
  // 권한 정보 가져오기
  useEffect(() => {
    const fetchPermissions = async () => {
      if (session?.user?.email) {
        try {
          // Supabase에서 직접 사용자 권한 가져오기
          const { data, error } = await supabase
            .from('user_permissions')
            .select('*')
            .eq('user_email', session.user.email)
            .single();
          
          if (data && !error) {
            setPermissions({
              role: data.role || 'user',
              canWrite: data.can_write || false,
            });
          }
        } catch (err) {
          console.error('Failed to fetch permissions:', err);
        }
      } else {
        setPermissions(null);
      }
      setLoading(false);
    };
    
    fetchPermissions();
  }, [session]);
  
  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
    role: permissions?.role || 'user',
    isAdmin: permissions?.role === 'admin',
    canWrite: permissions?.canWrite || false,
    canGrade: permissions?.role === 'admin' || permissions?.role === 'teacher',
  } : null;
  
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      router.push('/dashboard-beta');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
      throw err;
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('https://bluenote.site');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      // Supabase에서 직접 사용자 권한 가져오기
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_email', session.user.email)
        .single();
      
      if (data && !error) {
        setPermissions({
          role: data.role || 'user',
          canWrite: data.can_write || false,
        });
      }
    }
  };
  
  return (
    <UserContext.Provider
      value={{
        user,
        loading: loading || authLoading,
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