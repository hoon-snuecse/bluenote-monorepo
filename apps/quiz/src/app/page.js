import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { createAuthOptions } from '@bluenote/auth'

export default async function HomePage() {
  try {
    // 환경 변수 확인
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('NEXTAUTH_SECRET is not set')
      throw new Error('Authentication configuration error')
    }
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth credentials are not set')
      throw new Error('OAuth configuration error')
    }

    const authOptions = createAuthOptions()
    const session = await getServerSession(authOptions)
    
    if (session) {
      // 로그인된 사용자는 퀴즈 생성 페이지로
      redirect('/create')
    } else {
      // 로그인하지 않은 사용자는 로그인 페이지로
      redirect('/auth/signin')
    }
  } catch (error) {
    console.error('HomePage error:', error)
    // 에러 발생 시 로그인 페이지로 리다이렉트
    redirect('/auth/signin')
  }
}