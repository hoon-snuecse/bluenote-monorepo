import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

// Quiz 앱 전용 authOptions
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
}

export default async function HomePage() {
  try {
    // 환경 변수 확인
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('NEXTAUTH_SECRET is not set')
      // 에러 페이지로 리다이렉트
      redirect('/auth/error?error=Configuration')
    }
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth credentials are not set')
      // 에러 페이지로 리다이렉트
      redirect('/auth/error?error=Configuration')
    }

    const session = await getServerSession(authOptions)
    
    console.log('HomePage - session exists:', !!session)
    
    if (session) {
      // 로그인된 사용자는 퀴즈 생성 페이지로
      redirect('/create')
    } else {
      // 로그인하지 않은 사용자는 로그인 페이지로
      redirect('/auth/signin?callbackUrl=/create')
    }
  } catch (error) {
    console.error('HomePage error:', error)
    // 에러 발생 시 에러 페이지로 리다이렉트
    redirect('/auth/error?error=Default')
  }
}