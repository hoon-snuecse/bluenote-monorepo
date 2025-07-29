import NextAuth from 'next-auth'
import { createAuthOptions } from '@bluenote/auth'

// Quiz 앱용 권한 콜백 (필요시 사용)
const authCallbacks = {
  // Quiz 앱은 별도의 권한 관리가 필요없으므로 기본값 사용
}

const authOptions = createAuthOptions(authCallbacks)
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }