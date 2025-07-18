'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { Alert, AlertDescription } from '@bluenote/ui'
import { AlertCircle } from 'lucide-react'

function SignInContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard-beta'

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Bluenote Grading 로그인
          </CardTitle>
          <CardDescription className="text-center">
            Google 계정으로 로그인하여 평가 시스템을 이용하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error === 'OAuthSignin' && 'OAuth 로그인 중 오류가 발생했습니다.'}
                {error === 'OAuthCallback' && 'OAuth 콜백 처리 중 오류가 발생했습니다.'}
                {error === 'OAuthCreateAccount' && '계정 생성 중 오류가 발생했습니다.'}
                {error === 'EmailCreateAccount' && '이메일 계정 생성 중 오류가 발생했습니다.'}
                {error === 'Callback' && '콜백 처리 중 오류가 발생했습니다.'}
                {error === 'OAuthAccountNotLinked' && '이미 다른 방법으로 가입된 이메일입니다.'}
                {error === 'EmailSignin' && '이메일 로그인 중 오류가 발생했습니다.'}
                {error === 'CredentialsSignin' && '로그인 정보가 올바르지 않습니다.'}
                {error === 'SessionRequired' && '이 페이지에 접근하려면 로그인이 필요합니다.'}
                {error === 'Default' && '로그인 중 오류가 발생했습니다.'}
                {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'EmailCreateAccount', 'Callback', 'OAuthAccountNotLinked', 'EmailSignin', 'CredentialsSignin', 'SessionRequired', 'Default'].includes(error) && error}
              </AlertDescription>
            </Alert>
          )}
          
          <Button
            onClick={handleGoogleSignIn}
            className="w-full"
            size="lg"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>권한이 부여된 Google 계정으로만 로그인할 수 있습니다.</p>
            <p className="mt-1">문의: admin@bluenote.site</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}