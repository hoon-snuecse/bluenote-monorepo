'use client'

import { useState } from 'react'
import { Button } from '@bluenote/ui'
import { Textarea } from '@bluenote/ui'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@bluenote/ui'
import { Label } from '@bluenote/ui'
import { RadioGroup, RadioGroupItem } from '@bluenote/ui'
import { MessageSquare, Send, X } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other'
type FeedbackSentiment = 'positive' | 'neutral' | 'negative'

interface FeedbackData {
  type: FeedbackType
  sentiment: FeedbackSentiment
  message: string
  page: string
  userAgent: string
  timestamp: string
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('improvement')
  const [sentiment, setSentiment] = useState<FeedbackSentiment>('neutral')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showNotification } = useNotification()

  const handleSubmit = async () => {
    if (!message.trim()) {
      showNotification({
        title: '오류',
        message: '피드백 내용을 입력해주세요.',
        type: 'error',
      })
      return
    }

    setIsSubmitting(true)

    const feedbackData: FeedbackData = {
      type,
      sentiment,
      message: message.trim(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      })

      if (response.ok) {
        showNotification({
          title: '감사합니다!',
          message: '피드백이 성공적으로 전송되었습니다.',
          type: 'success',
        })
        setMessage('')
        setType('improvement')
        setSentiment('neutral')
        setIsOpen(false)
      } else {
        throw new Error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Feedback submission error:', error)
      showNotification({
        title: '오류',
        message: '피드백 전송에 실패했습니다. 다시 시도해주세요.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
          aria-label="피드백 보내기"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>피드백 보내기</DialogTitle>
          <DialogDescription>
            사용 중 불편한 점이나 개선 사항을 알려주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>피드백 유형</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as FeedbackType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bug" id="bug" />
                <Label htmlFor="bug" className="font-normal cursor-pointer">
                  버그 신고
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feature" id="feature" />
                <Label htmlFor="feature" className="font-normal cursor-pointer">
                  기능 제안
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="improvement" id="improvement" />
                <Label htmlFor="improvement" className="font-normal cursor-pointer">
                  개선 사항
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal cursor-pointer">
                  기타
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>사용 경험</Label>
            <RadioGroup value={sentiment} onValueChange={(value) => setSentiment(value as FeedbackSentiment)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="positive" id="positive" />
                <Label htmlFor="positive" className="font-normal cursor-pointer">
                  😊 만족
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="neutral" />
                <Label htmlFor="neutral" className="font-normal cursor-pointer">
                  😐 보통
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="negative" id="negative" />
                <Label htmlFor="negative" className="font-normal cursor-pointer">
                  😞 불만족
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">상세 내용</Label>
            <Textarea
              id="message"
              placeholder="자세한 내용을 작성해주세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
          >
            {isSubmitting ? (
              <>
                <Send className="mr-2 h-4 w-4 animate-pulse" />
                전송 중...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                보내기
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}