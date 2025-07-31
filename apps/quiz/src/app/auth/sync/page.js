'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SyncContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('syncing')
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function syncSession() {
      try {
        // 현재 브라우저의 쿠키를 가져와서 서버에 전달
        const cookieHeader = document.cookie;
        
        console.log('[Sync Page] Starting server-side sync');
        
        // 서버 사이드 동기화 요청
        const syncResponse = await fetch('/api/auth/server-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cookieHeader }),
        })
        
        if (!syncResponse.ok) {
          throw new Error('Failed to sync session')
        }
        
        console.log('[Sync Page] Session synced successfully')
        setStatus('success')
        
        // 원래 요청했던 페이지로 리다이렉트
        const callbackUrl = searchParams.get('callbackUrl') || '/create'
        setTimeout(() => {
          router.push(callbackUrl)
        }, 1000)
        
      } catch (err) {
        console.error('[Sync Page] Error:', err)
        setError(err.message)
        setStatus('error')
      }
    }
    
    syncSession()
  }, [router, searchParams])
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {status === 'syncing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">세션 동기화 중...</h2>
            <p className="text-gray-600">메인 사이트의 로그인 정보를 가져오고 있습니다.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">동기화 완료!</h2>
            <p className="text-gray-600">잠시 후 페이지로 이동합니다...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">동기화 실패</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <a 
              href="https://www.bluenote.site/auth/signin"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              메인 사이트에서 로그인
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default function SyncPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SyncContent />
    </Suspense>
  )
}