// Quiz 앱용 NextAuth 설정
import { createAuthOptions } from '@bluenote/auth'

// Quiz 앱용 권한 콜백 (필요시 사용)
const authCallbacks = {
  // Quiz 앱은 별도의 권한 관리가 필요없으므로 기본값 사용
}

export const authOptions = createAuthOptions(authCallbacks)

// 서버 컴포넌트에서 세션 가져오기
export { getServerSession } from 'next-auth/next'