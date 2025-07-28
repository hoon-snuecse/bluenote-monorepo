import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Quiz 앱 전용 인증 옵션 - Google Drive 권한 없이
const authOptions = {
  // Web 앱과 동일한 쿠키 설정으로 세션 공유
  useSecureCookies: false,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }