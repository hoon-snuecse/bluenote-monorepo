'use client'

import { TabNavigation } from '@/components/Navigation/TabNavigation'
import { AuthWrapper } from '@bluenote/auth'

export default function QuizLayout({ children }) {
  return (
    <AuthWrapper 
      requireAuth={true}
      redirectTo="/auth/signin"
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 pt-16">
        <TabNavigation />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </AuthWrapper>
  )
}