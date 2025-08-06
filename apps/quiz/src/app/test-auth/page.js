import { cookies } from 'next/headers'
import { createServerClient } from '@bluenote/supabase-auth/server'

export default async function TestAuthPage() {
  const supabase = createServerClient()
  
  // 세션 확인
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // 쿠키 확인
  const cookieStore = cookies()
  const authCookies = cookieStore.getAll().filter(c => c.name.includes('sb-'))
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">서버 사이드 인증 테스트</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">세션 상태</h2>
          {session ? (
            <div>
              <p className="text-green-600 font-medium">✓ 세션이 있습니다</p>
              <p className="text-sm mt-2">사용자: {session.user.email}</p>
              <p className="text-sm">ID: {session.user.id}</p>
            </div>
          ) : (
            <div>
              <p className="text-red-600 font-medium">✗ 세션이 없습니다</p>
              {error && <p className="text-sm text-gray-600 mt-2">에러: {error.message}</p>}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Auth 관련 쿠키</h2>
          <div className="space-y-2">
            {authCookies.map((cookie, idx) => (
              <div key={idx} className="border-b pb-2">
                <p className="text-sm font-medium">{cookie.name}</p>
                <p className="text-xs text-gray-600">
                  값 길이: {cookie.value.length} 문자
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">테스트 액션</h2>
          <div className="space-y-4">
            <a 
              href="/auth/signin"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              로그인 페이지로
            </a>
            
            <p className="text-sm text-gray-600">
              로그인 후 이 페이지로 돌아와서 세션이 인식되는지 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}