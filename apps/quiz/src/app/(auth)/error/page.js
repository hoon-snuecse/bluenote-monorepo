'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@bluenote/ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const description = searchParams.get('description')
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    // 디버그 정보 수집
    const info = {
      currentUrl: window.location.href,
      origin: window.location.origin,
      referrer: document.referrer,
      cookies: document.cookie.split(';').map(c => c.trim()).filter(c => c.startsWith('sb-')).map(c => c.split('=')[0]),
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
  }, [])

  const getErrorMessage = () => {
    switch (error) {
      case 'server_error':
        if (description?.includes('Unable to exchange external code')) {
          return {
            title: 'OAuth 인증 실패',
            message: 'Google 로그인 코드를 교환하는 중 오류가 발생했습니다.',
            details: 'Supabase와 Google OAuth 설정을 확인해주세요.',
            actions: [
              'Google Cloud Console에서 Redirect URI 확인',
              'Supabase Dashboard에서 Google Provider 설정 확인',
              'Client ID와 Client Secret이 올바른지 확인'
            ]
          }
        }
        return {
          title: '서버 오류',
          message: description || '서버에서 오류가 발생했습니다.',
          details: '잠시 후 다시 시도해주세요.'
        }
      
      case 'session_error':
        return {
          title: '세션 생성 실패',
          message: description || '로그인 세션을 생성할 수 없습니다.',
          details: '브라우저 쿠키가 활성화되어 있는지 확인해주세요.'
        }
      
      case 'processing_error':
        return {
          title: '처리 오류',
          message: description || '인증 처리 중 오류가 발생했습니다.',
          details: '콜백 URL 처리 중 문제가 발생했습니다.'
        }
      
      case 'missing_code':
        return {
          title: '인증 코드 없음',
          message: 'OAuth 인증 코드가 제공되지 않았습니다.',
          details: 'Google 로그인 프로세스가 올바르게 완료되지 않았습니다.'
        }
      
      default:
        return {
          title: '인증 오류',
          message: description || '로그인 중 오류가 발생했습니다.',
          details: '다시 시도하거나 관리자에게 문의해주세요.'
        }
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-red-600">⚠️ {errorInfo.title}</CardTitle>
          <CardDescription>{errorInfo.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-gray-700">{errorInfo.details}</p>
          </div>

          {errorInfo.actions && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">확인 사항:</p>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                {errorInfo.actions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-gray-100 rounded-md p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-600">디버그 정보:</p>
            <div className="text-xs text-gray-500 space-y-1 font-mono">
              <p>Error: {error}</p>
              <p>Description: {description}</p>
              <p>Origin: {debugInfo.origin}</p>
              <p>Referrer: {debugInfo.referrer || 'none'}</p>
              <p>Supabase Cookies: {debugInfo.cookies?.join(', ') || 'none'}</p>
              <p>Time: {debugInfo.timestamp}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link 
              href="/auth/signin"
              className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              다시 로그인
            </Link>
            <Link 
              href="/debug-auth"
              className="flex-1 text-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              디버그 페이지
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}