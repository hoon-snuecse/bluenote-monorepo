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

export default function CreateQuizPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">퀴즈 생성</h1>
        <p className="mt-1 text-sm text-gray-600">
          AI의 도움을 받아 Kahoot 퀴즈를 쉽게 만들어보세요
        </p>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow">
        <QuizBuilder />
      </div>
    </div>
  )
}