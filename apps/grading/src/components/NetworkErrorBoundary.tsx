'use client'

import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { WifiOff, RefreshCw } from 'lucide-react'

export function NetworkErrorBoundary({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // 초기 상태 설정
    setIsOnline(navigator.onLine)

    // 이벤트 리스너 등록
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleRetry = async () => {
    setRetrying(true)
    
    // 네트워크 연결 테스트
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        setIsOnline(true)
      }
    } catch (error) {
      setIsOnline(false)
    } finally {
      setRetrying(false)
    }
  }

  if (!isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>인터넷 연결 끊김</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              <p>인터넷 연결을 확인해주세요.</p>
              <p className="text-sm text-muted-foreground">
                연결이 복구되면 자동으로 다시 시도됩니다.
              </p>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={retrying}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? '확인 중...' : '다시 시도'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}