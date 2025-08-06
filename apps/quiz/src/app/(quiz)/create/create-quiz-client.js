'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const QuizBuilder = dynamic(() => import('@/components/QuizBuilder'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="ml-3 text-gray-600">퀴즈 빌더 로딩 중...</span>
    </div>
  )
})

export default function CreateQuizClient({ initialSession }) {
  return <QuizBuilder initialSession={initialSession} />
}