import { createAuthOptions, getServerSession as getNextAuthSession } from '@bluenote/auth'

// Quiz 앱용 인증 콜백 함수들
const authCallbacks = {
  // Quiz 앱은 기본적으로 모든 로그인한 사용자 허용
  checkUserPermission: async (email) => {
    return true; // 모든 Google 로그인 사용자 허용
  },
  
  // 사용자 권한 정보 가져오기
  getUserPermissions: async (email) => {
    // Quiz 앱은 특별한 권한 체계가 없으므로 기본값 반환
    return {
      role: 'user',
      can_write: true,
      claude_daily_limit: 10, // Quiz 앱의 AI 사용 제한
    };
  },
  
  // 로그인 기록
  logSignIn: async (email) => {
    console.log(`[Quiz App] User ${email} signed in`);
  },
};

// @bluenote/auth 패키지의 공유 인증 설정 사용
export const authOptions = createAuthOptions(authCallbacks)

// 서버 사이드에서 세션 가져오기
export async function getServerSession(req, res) {
  // Next.js 13+ App Router의 경우
  if (!req && !res) {
    return getNextAuthSession(authOptions)
  }
  
  // API Routes의 경우
  return getNextAuthSession(req, res, authOptions)
}