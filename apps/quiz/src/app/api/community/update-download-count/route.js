import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getServerSession, authOptions } from '@/lib/auth'

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

    const supabase = createClient()
    
    // 다운로드 수 증가
    const { data: currentData, error: fetchError } = await supabase
      .from('shared_quizzes')
      .select('download_count')
      .eq('id', sharedQuizId)
      .single()

    if (!fetchError && currentData) {
      const { error: updateError } = await supabase
        .from('shared_quizzes')
        .update({ 
          download_count: (currentData.download_count || 0) + 1 
        })
        .eq('id', sharedQuizId)

      if (updateError) {
      }
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
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}