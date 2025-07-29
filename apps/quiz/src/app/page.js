import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { cookies } from 'next/headers'

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

    // 세션 확인 전에 쿠키 상태 로깅
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    console.log('HomePage - available cookies:', allCookies.map(c => c.name))

    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (sessionError) {
      console.error('Failed to get session:', sessionError)
      // 세션 에러는 무시하고 진행 (세션이 없는 것으로 처리)
    }
    
    console.log('HomePage - session:', {
      exists: !!session,
      email: session?.user?.email,
      id: session?.user?.id
    })
    
    if (session) {
      // 로그인된 사용자는 퀴즈 생성 페이지로
      redirect('/create')
    } else {
      // 로그인하지 않은 사용자는 세션 동기화 시도
      redirect('/auth/sync-session')
    }
  } catch (error) {
    console.error('HomePage error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    // 에러 발생 시 로그인 페이지로 리다이렉트 (무한 루프 방지)
    redirect('/auth/signin')
  }
}