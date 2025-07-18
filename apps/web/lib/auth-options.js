import GoogleProvider from 'next-auth/providers/google';
import { createClientForServer } from '@/lib/supabase/server';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 모든 Google 로그인 허용
      return true;
    },
    async session({ session, token }) {
      // 세션에 추가 정보 포함
      if (session?.user) {
        session.user.id = token.sub || token.id;
        session.user.isAdmin = token.isAdmin || false;
        session.user.canWrite = token.canWrite || false;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // 관리자 이메일 확인 - JWT에도 저장
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
        token.isAdmin = adminEmails.includes(user.email);
        
        // Supabase에서 사용자 권한 확인
        try {
          const supabase = createClientForServer();
          const { data: userPermission } = await supabase
            .from('user_permissions')
            .select('can_write, role')
            .eq('email', user.email)
            .single();
          
          if (userPermission) {
            token.canWrite = userPermission.can_write || false;
            // role이 admin인 경우도 확인
            if (userPermission.role === 'admin') {
              token.isAdmin = true;
            }
          } else {
            token.canWrite = false;
          }
        } catch (error) {
          console.error('Error fetching user permissions:', error);
          token.canWrite = false;
        }
      }
      
      // 기존 token의 권한 값이 없으면 재확인
      if (token.email && (token.isAdmin === undefined || token.canWrite === undefined)) {
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
        token.isAdmin = adminEmails.includes(token.email);
        
        // Supabase에서 권한 재확인
        try {
          const supabase = createClientForServer();
          const { data: userPermission } = await supabase
            .from('user_permissions')
            .select('can_write, role')
            .eq('email', token.email)
            .single();
          
          if (userPermission) {
            token.canWrite = userPermission.can_write || false;
            if (userPermission.role === 'admin') {
              token.isAdmin = true;
            }
          } else {
            token.canWrite = false;
          }
        } catch (error) {
          console.error('Error fetching user permissions:', error);
          token.canWrite = false;
        }
      }
      
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
};