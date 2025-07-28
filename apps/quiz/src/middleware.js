import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})

// 보호된 라우트 설정
export const config = {
  matcher: [
    '/create/:path*',
    '/my-quizzes/:path*',
    '/api/quizzes/:path*',
    '/api/ai/:path*',
    '/api/export/:path*',
    '/api/share/:path*',
  ],
}