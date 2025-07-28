import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const supabase = createClient()

    // 퀴즈 정보 가져오기
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        topic,
        description,
        total_questions,
        metadata,
        created_at,
        user_email
      `)
      .eq('id', id)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: '퀴즈를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 문항 정보 가져오기
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        question_type,
        time_limit,
        explanation,
        order_index
      `)
      .eq('quiz_id', id)
      .order('order_index')

    if (questionsError) {
      return NextResponse.json(
        { error: '문항을 불러올 수 없습니다.' },
        { status: 500 }
      )
    }

    // 각 문항의 선택지 가져오기
    const questionIds = questions.map(q => q.id)
    const { data: options } = await supabase
      .from('question_options')
      .select('*')
      .in('question_id', questionIds)
      .order('order_index')

    // 문항과 선택지 매핑
    const questionsWithOptions = questions.map(q => ({
      ...q,
      options: options
        .filter(opt => opt.question_id === q.id)
        .sort((a, b) => a.order_index - b.order_index)
    }))

    return NextResponse.json({
      quiz: {
        ...quiz,
        user_name: quiz.user_email?.split('@')[0] || '익명'
      },
      questions: questionsWithOptions
    })

  } catch (error) {
    console.error('Quiz detail error:', error)
    return NextResponse.json(
      { error: '퀴즈 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}