import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { createAuthOptions } from '@bluenote/auth'

export default async function HomePage() {
  const session = await getServerSession(createAuthOptions())
  
  if (session) {
    // 로그인된 사용자는 퀴즈 생성 페이지로
    redirect('/create')
  } else {
    // 로그인하지 않은 사용자는 로그인 페이지로
    redirect('/auth/signin')
  }
}