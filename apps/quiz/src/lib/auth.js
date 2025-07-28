import { createAuthOptions } from '@bluenote/auth'

// Quiz 앱용 NextAuth 설정
export const getAuthOptions = () => {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not set')
  }
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials are not set')
  }
  
  return createAuthOptions()
}

// 서버 컴포넌트에서 세션 가져오기
export { getServerSession } from 'next-auth/next'