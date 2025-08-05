import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getServerSession as getNextAuthSession } from 'next-auth'

// NextAuth 설정
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.picture
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // 외부 URL로의 리다이렉트 허용
      if (url.startsWith('https://www.bluenote.site') || url.startsWith('https://quiz.bluenote.site')) {
        return url
      }
      // 개발 환경에서 localhost 리다이렉트 허용
      if (url.includes('localhost')) {
        return url
      }
      // 기본적으로 baseUrl로 리다이렉트
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      return baseUrl
    },
  },
  pages: {
    signIn: process.env.NODE_ENV === 'production' 
      ? 'https://www.bluenote.site/auth/signin'
      : 'http://localhost:3000/auth/signin',
    error: '/auth/error',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.bluenote.site' : undefined,
      },
    },
  },
}

// 서버 사이드에서 세션 가져오기
export async function getServerSession(req, res) {
  // Next.js 13+ App Router의 경우
  if (!req && !res) {
    return getNextAuthSession(authOptions)
  }
  
  // API Routes의 경우
  return getNextAuthSession(req, res, authOptions)
}