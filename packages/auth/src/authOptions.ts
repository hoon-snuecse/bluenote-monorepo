import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

// 확장된 세션 타입 정의
export interface ExtendedSession extends Session {
  user: {
    id: string;  // 이제 필수 필드로 변경
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAdmin?: boolean;
    canWrite?: boolean;
    claudeDailyLimit?: number;
    role?: string;
  };
  accessToken?: string;
}

// 확장된 JWT 타입 정의
export interface ExtendedJWT extends JWT {
  isAdmin?: boolean;
  canWrite?: boolean;
  claudeDailyLimit?: number;
  userRole?: string;
}

// Supabase 관련 함수들은 각 앱에서 주입받도록 인터페이스 정의
export interface AuthCallbacks {
  checkUserPermission?: (email: string) => Promise<boolean>;
  getUserPermissions?: (email: string) => Promise<{
    role: string;
    can_write: boolean;
    claude_daily_limit: number;
  } | null>;
  logSignIn?: (email: string) => Promise<void>;
}

export const createAuthOptions = (callbacks?: AuthCallbacks): NextAuthOptions => {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || ['hoon@snuecse.org'];

  return {
    // 쿠키 설정 - 프로덕션에서는 서브도메인 간 공유를 위해 .bluenote.site 도메인 사용
    // useSecureCookies를 false로 설정하여 쿠키 이름이 자동으로 변경되지 않도록 함
    useSecureCookies: false,
    cookies: {
      sessionToken: {
        name: `next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          // 중요: 프로덕션에서는 .bluenote.site 도메인으로 설정하여 서브도메인 간 공유
          domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined
        }
      },
      callbackUrl: {
        name: `next-auth.callback-url`,
        options: {
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined
        }
      },
      csrfToken: {
        name: `next-auth.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined
        }
      }
    },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          params: {
            scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      }),
    ],
    callbacks: {
      async signIn({ user, account }) {
        // 기본적으로 모든 Google 로그인 허용
        // 필요시 callbacks.checkUserPermission 사용
        if (callbacks?.checkUserPermission) {
          return await callbacks.checkUserPermission(user.email!);
        }
        return true;
      },
      async jwt({ token, user, account }) {
        // 첫 로그인 시 토큰 정보 추가
        if (account && user) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          
          // 로그인 활동 기록 (첫 로그인 시만)
          if (callbacks?.logSignIn && user.email) {
            console.log('[JWT Callback] Recording login for:', user.email);
            try {
              await callbacks.logSignIn(user.email);
            } catch (error) {
              console.error('[JWT Callback] Error logging sign in:', error);
            }
          }
          
          // 사용자 권한 확인
          if (callbacks?.getUserPermissions && user.email) {
            try {
              const permissions = await callbacks.getUserPermissions(user.email);
              
              if (permissions) {
                token.isAdmin = permissions.role === 'admin';
                token.canWrite = permissions.can_write;
                token.claudeDailyLimit = permissions.claude_daily_limit;
                token.userRole = permissions.role;
              } else {
                // 권한 정보가 없으면 기본값 사용
                token.isAdmin = adminEmails.includes(user.email);
                token.canWrite = token.isAdmin;
                token.claudeDailyLimit = token.isAdmin ? 999999 : 3;
                token.userRole = token.isAdmin ? 'admin' : 'user';
              }
            } catch (error) {
              console.error('Error fetching user permissions:', error);
              // 에러 시 기본값
              token.isAdmin = false;
              token.canWrite = false;
              token.claudeDailyLimit = 0;
              token.userRole = 'user';
            }
          } else {
            // 콜백이 없으면 환경변수 기반 권한 설정
            token.isAdmin = adminEmails.includes(user.email!);
            token.canWrite = token.isAdmin;
            token.claudeDailyLimit = token.isAdmin ? 999999 : 3;
            token.userRole = token.isAdmin ? 'admin' : 'user';
          }
        }
        
        return token as ExtendedJWT;
      },
      async session({ session, token }) {
        const extendedToken = token as ExtendedJWT;
        const extendedSession = session as ExtendedSession;
        
        // user.id 추가 (Google OAuth의 고유 ID)
        if (token.sub) {
          extendedSession.user.id = token.sub;
        }
        
        extendedSession.user.isAdmin = extendedToken.isAdmin || false;
        extendedSession.user.canWrite = extendedToken.canWrite || false;
        extendedSession.user.claudeDailyLimit = extendedToken.claudeDailyLimit || 0;
        extendedSession.user.role = extendedToken.userRole || 'user';
        
        // Google Drive API 접근을 위한 토큰 추가
        if (extendedToken.accessToken) {
          extendedSession.accessToken = extendedToken.accessToken as string;
        }
        
        return extendedSession;
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    events: {
      async signIn(message) {
        console.log('[NextAuth] signIn event triggered:', message.user?.email);
        // 로그인 성공 시 로그 기록
        if (callbacks?.logSignIn && message.user?.email) {
          try {
            console.log('[NextAuth] Calling logSignIn for:', message.user.email);
            await callbacks.logSignIn(message.user.email);
          } catch (error) {
            console.error('[NextAuth] Error logging sign in:', error);
          }
        } else {
          console.log('[NextAuth] logSignIn callback not available or no email');
        }
      },
    },
  };
};