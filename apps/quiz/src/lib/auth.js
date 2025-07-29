import { createAuthOptions } from '@bluenote/auth'

// Quiz 앱용 권한 콜백
const authCallbacks = {
  // Quiz 앱의 경우 로그인한 모든 사용자가 접근 가능하므로
  // 특별한 권한 체크는 필요없지만, 로그 기록은 유지
  logSignIn: async (email) => {
    console.log(`User ${email} signed in to Quiz app`)
  },
  
  // 기본적으로 모든 로그인 사용자 허용
  checkUserPermission: async (email) => {
    return true
  },
  
  // 기본 권한 설정
  getUserPermissions: async (email) => {
    return {
      role: 'user',
      can_write: true,
      claude_daily_limit: 10
    }
  }
}

// 공유 auth 설정 사용
export const authOptions = createAuthOptions(authCallbacks)