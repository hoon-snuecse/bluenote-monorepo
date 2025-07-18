import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    // 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser()
    
    // 피드백 데이터 준비
    const feedbackData = {
      user_id: user?.id || null,
      user_email: user?.email || null,
      type: body.type,
      sentiment: body.sentiment,
      message: body.message,
      page: body.page,
      user_agent: body.userAgent,
      created_at: new Date().toISOString(),
      metadata: {
        timestamp: body.timestamp,
        app: 'grading',
      }
    }

    // Supabase에 피드백 저장
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single()

    if (error) {
      console.error('Feedback storage error:', error)
      
      // 테이블이 없는 경우 로컬 로그로 대체
      if (error.code === '42P01') {
        console.log('Feedback (stored locally):', feedbackData)
        
        // 개발 환경에서는 콘솔에 출력
        if (process.env.NODE_ENV === 'development') {
          console.log('\n📝 사용자 피드백:')
          console.log(`- 유형: ${feedbackData.type}`)
          console.log(`- 감정: ${feedbackData.sentiment}`)
          console.log(`- 페이지: ${feedbackData.page}`)
          console.log(`- 메시지: ${feedbackData.message}`)
          console.log(`- 사용자: ${feedbackData.user_email || '익명'}`)
          console.log('---\n')
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Feedback logged successfully (local)' 
        })
      }
      
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Feedback submitted successfully' 
    })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}