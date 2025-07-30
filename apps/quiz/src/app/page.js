import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  try {
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