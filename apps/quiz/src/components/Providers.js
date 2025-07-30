'use client'

export function Providers({ children }) {
  // Quiz 앱은 메인 사이트의 세션을 사용하므로
  // 자체 SessionProvider를 사용하지 않음
  return <>{children}</>
}