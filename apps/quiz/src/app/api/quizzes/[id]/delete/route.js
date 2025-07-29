import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

export async function DELETE(request, { params }) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = params
    const supabase = createServiceClient()

    // 퀴즈 소유자 확인
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('user_email')
      .eq('id', id)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: '퀴즈를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 소유자만 삭제 가능
    if (quiz.user_email !== session.user.email) {
      return NextResponse.json(
        { error: '본인의 퀴즈만 삭제할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 관련 데이터 삭제 (cascade로 자동 삭제되어야 하지만 명시적으로 처리)
    // 1. 선택지 삭제
    const { data: questions } = await supabase
      .from('questions')
      .select('id')
      .eq('quiz_id', id)

    if (questions) {
      const questionIds = questions.map(q => q.id)
      await supabase
        .from('question_options')
        .delete()
        .in('question_id', questionIds)
    }

    // 2. 문항 삭제
    await supabase
      .from('questions')
      .delete()
      .eq('quiz_id', id)

    // 3. 공유 퀴즈 삭제
    await supabase
      .from('shared_quizzes')
      .delete()
      .eq('quiz_id', id)

    // 4. 퀴즈 삭제
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete quiz error:', deleteError)
      return NextResponse.json(
        { error: '퀴즈 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: '퀴즈가 삭제되었습니다.' 
    })

  } catch (error) {
    console.error('Delete quiz error:', error)
    return NextResponse.json(
      { error: '퀴즈 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}