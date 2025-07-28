import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export default async function HomePage() {
  try {
    // 환경 변수 확인
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('NEXTAUTH_SECRET is not set')
      redirect('/auth/error?error=Configuration')
    }
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth credentials are not set')
      redirect('/auth/error?error=Configuration')
    }

    const session = await getServerSession(authOptions)
    
    console.log('HomePage - session:', {
      exists: !!session,
      email: session?.user?.email,
      id: session?.user?.id
    })
    
    if (session) {
      // 로그인된 사용자는 퀴즈 생성 페이지로
      redirect('/create')
    } else {
      // 로그인하지 않은 사용자는 로그인 페이지로
      redirect('/auth/signin')
    }
  } catch (error) {
    console.error('HomePage error details:', {
      message: error.message,
      stack: error.stack
    })
    // 에러 발생 시 에러 페이지로 리다이렉트
    redirect('/auth/error?error=Default')
  }
}