import { getServerSession as getNextAuthSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'

// NextAuth 설정 (apps/quiz/src/app/api/auth/[...nextauth]/route.js와 동일)
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
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

// JWT 토큰 가져오기
export async function getAuthToken(req) {
  return getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  })
}