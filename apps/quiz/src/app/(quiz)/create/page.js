import { createServerClient } from '@bluenote/supabase-auth/server'
import CreateQuizClient from './create-quiz-client'

export default async function CreateQuizPage() {
  // 서버에서 세션 확인
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">퀴즈 생성</h1>
        <p className="mt-1 text-sm text-gray-600">
          AI의 도움을 받아 Kahoot 퀴즈를 쉽게 만들어보세요
        </p>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow">
        <CreateQuizClient initialSession={session} />
      </div>
    </div>
  )
}