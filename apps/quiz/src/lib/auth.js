import { authOptions } from '@bluenote/auth'
import NextAuth from 'next-auth'

// Quiz 앱용 NextAuth 설정
export const auth = NextAuth(authOptions)

// 서버 컴포넌트에서 세션 가져오기
export { getServerSession } from 'next-auth/next'