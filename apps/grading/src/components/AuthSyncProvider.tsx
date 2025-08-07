'use client';

/**
 * AuthSyncProvider - Supabase Auth 마이그레이션 후 간소화
 * 
 * 이전: NextAuth와 메인 앱 간 세션 동기화
 * 현재: Supabase Auth가 자동으로 세션 관리
 */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  // Supabase Auth는 자체적으로 세션을 관리하므로
  // 별도의 동기화 로직이 필요하지 않음
  return <>{children}</>;
}