import { cookies } from 'next/headers'
import { createServerClient } from '@bluenote/supabase-auth/server'

export default async function ServerDebugPage() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const supabaseCookies = allCookies.filter(c => c.name.includes('sb-'))
  
  const supabase = await createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">서버 사이드 디버그</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">현재 도메인</h2>
          <p className="text-sm text-gray-600">quiz.bluenote.site</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Supabase 세션</h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✓ 세션이 있습니다</p>
              <p className="text-sm"><strong>사용자 ID:</strong> {session.user.id}</p>
              <p className="text-sm"><strong>이메일:</strong> {session.user.email}</p>
              <p className="text-sm"><strong>Provider:</strong> {session.user.app_metadata?.provider}</p>
              <p className="text-sm"><strong>만료:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</p>
            </div>
          ) : (
            <div>
              <p className="text-red-600 font-medium">✗ 세션이 없습니다</p>
              {error && <p className="text-sm text-gray-600 mt-2">에러: {error.message}</p>}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">모든 Supabase 관련 쿠키 (서버에서 본)</h2>
          <div className="space-y-2">
            {supabaseCookies.map((cookie, idx) => (
              <div key={idx} className="border-b pb-2">
                <p className="text-sm font-medium">{cookie.name}</p>
                <p className="text-xs text-gray-600">
                  길이: {cookie.value.length} 문자
                </p>
                <p className="text-xs text-gray-500">
                  {cookie.name.includes('auth-token') && !cookie.name.includes('code-verifier') && '✅ 인증 토큰'}
                  {cookie.name.includes('code-verifier') && '🔑 PKCE verifier'}
                  {cookie.name.includes('refresh-token') && '🔄 리프레시 토큰'}
                </p>
              </div>
            ))}
            {supabaseCookies.length === 0 && (
              <p className="text-gray-500 text-sm">Supabase 쿠키가 없습니다</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">인증 토큰 청킹 상태</h2>
          <div className="space-y-2">
            {supabaseCookies
              .filter(c => c.name.includes('auth-token') && c.name.match(/\.\d+$/))
              .sort((a, b) => {
                const aNum = parseInt(a.name.match(/\.(\d+)$/)?.[1] || '0')
                const bNum = parseInt(b.name.match(/\.(\d+)$/)?.[1] || '0')
                return aNum - bNum
              })
              .map((cookie, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium">{cookie.name}:</span> {cookie.value.length} 문자
                </div>
              ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">테스트 액션</h2>
          <div className="space-y-4">
            <a 
              href="/create"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
            >
              퀴즈 생성 페이지로
            </a>
            
            <a 
              href="/auth/signout"
              className="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              로그아웃
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}