import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getServerSession } from '@bluenote/auth'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sharedQuizId, quizId, format } = await request.json()
    
    if (!sharedQuizId || !quizId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const supabase = createServiceClient()
    
    // 다운로드 수 증가
    const { error: updateError } = await supabase
      .from('shared_quizzes')
      .update({ 
        download_count: supabase.sql`download_count + 1` 
      })
      .eq('id', sharedQuizId)

    if (updateError) {
      console.error('Failed to update download count:', updateError)
    }

    // 다운로드 기록 저장
    const { error: insertError } = await supabase
      .from('quiz_downloads')
      .insert({
        quiz_id: quizId,
        user_email: session.user.email,
        format: format
      })

    if (insertError) {
      console.error('Failed to insert download record:', insertError)
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}