'use client'

import { AuthProvider } from '@bluenote/auth'

export function Providers({ children }) {
  // Fetch API 어댑터를 사용하는 AuthProvider
  // Quiz 앱은 React 버전 충돌로 인해 FetchAdapter를 기본으로 사용
  return (
    <AuthProvider options={{ apiEndpoint: '/api/auth' }}>
      {children}
    </AuthProvider>
  )
}