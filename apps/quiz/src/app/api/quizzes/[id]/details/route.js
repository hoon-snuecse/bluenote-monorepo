import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getServerSession } from '@bluenote/auth'
import { authOptions } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const supabase = createClient()

    // RLS 컨텍스트 설정
    if (session.user?.email) {
      await supabase.rpc('set_current_user_email', { 
        email: session.user.email 
      })
    }

    // 퀴즈 기본 정보 가져오기
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .eq('user_email', session.user.email) // 본인 퀴즈만 편집 가능
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: '퀴즈를 찾을 수 없거나 권한이 없습니다.' },
        { status: 404 }
      )
    }

    // 문항과 선택지 가져오기
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        *,
        options:question_options(*)
      `)
      .eq('quiz_id', id)
      .order('order_index', { ascending: true })

    if (questionsError) {
      return NextResponse.json(
        { error: '문항을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 선택지를 order_index 순으로 정렬
    const formattedQuestions = questions.map(q => ({
      ...q,
      options: q.options.sort((a, b) => a.order_index - b.order_index)
    }))

    return NextResponse.json({
      quiz,
      questions: formattedQuestions
    })

  } catch (error) {
    return NextResponse.json(
      { error: '퀴즈 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}