'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui'
import { ScrollArea } from '@bluenote/ui'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Update {
  type: 'evaluation_started' | 'evaluation_completed' | 'error'
  studentName?: string
  timestamp?: string
  overallLevel?: string
  error?: string
}

interface RealtimeUpdatesProps {
  updates: Update[]
}

export function RealtimeUpdates({ updates }: RealtimeUpdatesProps) {
  const [visibleUpdates, setVisibleUpdates] = useState<Update[]>([])

  useEffect(() => {
    // 최근 10개의 업데이트만 표시
    setVisibleUpdates(updates.slice(-10).reverse())
  }, [updates])

  if (visibleUpdates.length === 0) {
    return null
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">실시간 업데이트</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[200px] px-4">
          <div className="space-y-2 pb-4">
            {visibleUpdates.map((update, index) => (
              <div
                key={index}
                className="flex items-start gap-3 py-2 border-b last:border-0"
              >
                {update.type === 'evaluation_started' && (
                  <>
                    <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{update.studentName} 평가 시작</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(update.timestamp || '').toLocaleTimeString('ko-KR')}
                      </p>
                    </div>
                  </>
                )}
                {update.type === 'evaluation_completed' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{update.studentName} 평가 완료</p>
                      <p className="text-xs text-muted-foreground">
                        수준: {update.overallLevel} • {new Date(update.timestamp || '').toLocaleTimeString('ko-KR')}
                      </p>
                    </div>
                  </>
                )}
                {update.type === 'error' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-red-600">평가 오류</p>
                      <p className="text-xs text-muted-foreground">
                        {update.error || '알 수 없는 오류'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}