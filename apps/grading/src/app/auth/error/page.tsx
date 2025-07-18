'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { Alert, AlertDescription } from '@bluenote/ui'
import { AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return '서버 구성에 문제가 있습니다. 관리자에게 문의하세요.'
      case 'AccessDenied':
        return '접근이 거부되었습니다. 권한이 부여된 계정으로 로그인하세요.'
      case 'Verification':
        return '인증 토큰이 만료되었거나 이미 사용되었습니다.'
      default:
        return '인증 과정에서 오류가 발생했습니다.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-destructive">
            인증 오류
          </CardTitle>
          <CardDescription className="text-center">
            로그인 과정에서 문제가 발생했습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getErrorMessage()}</AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                다시 로그인하기
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>계속해서 문제가 발생하면 관리자에게 문의하세요.</p>
            <p className="mt-1">문의: admin@bluenote.site</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}