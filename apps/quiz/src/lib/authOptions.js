import GoogleProvider from 'next-auth/providers/google'

// Quiz 앱 전용 인증 옵션 - Web 앱과 동일한 설정으로 세션 공유
export const authOptions = {
  // Vercel 프로덕션 환경에서는 자동으로 보안 쿠키 사용
  useSecureCookies: process.env.VERCEL_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.VERCEL_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
        // 중요: 프로덕션에서 서브도메인 간 공유를 위한 도메인 설정
        domain: process.env.VERCEL_ENV === 'production' ? '.bluenote.site' : undefined
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.VERCEL_ENV === 'production',
        domain: process.env.VERCEL_ENV === 'production' ? '.bluenote.site' : undefined
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.VERCEL_ENV === 'production',
        domain: process.env.VERCEL_ENV === 'production' ? '.bluenote.site' : undefined
      }
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // Quiz 앱은 Google Drive 권한 불필요
          scope: 'openid email profile',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // 모든 Google 로그인 허용
      console.log('Quiz app - user signed in:', user.email)
      return true
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      // Quiz 앱 사용자는 기본 권한
      session.user.isAdmin = false
      session.user.canWrite = true
      session.user.claudeDailyLimit = 50
      session.user.role = 'user'
      
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
}