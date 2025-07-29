import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { createAuthOptions } from '@bluenote/auth'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const supabase = createServiceClient()

    // 먼저 shared_quizzes에서 퀴즈 정보 가져오기
    const { data: sharedQuiz, error: sharedError } = await supabase
      .from('shared_quizzes')
      .select(`
        id,
        quiz_id,
        title,
        description,
        subject_category,
        grade_level,
        total_questions,
        true_false_count,
        multiple_choice_count,
        user_email,
        created_at
      `)
      .eq('id', id)
      .single()

    if (sharedError || !sharedQuiz) {
      return NextResponse.json(
        { error: '퀴즈를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    const quizId = sharedQuiz.quiz_id
    const quiz = {
      id: quizId,
      title: sharedQuiz.title,
      description: sharedQuiz.description,
      total_questions: sharedQuiz.total_questions,
      true_false_count: sharedQuiz.true_false_count,
      multiple_choice_count: sharedQuiz.multiple_choice_count,
      user_email: sharedQuiz.user_email,
      created_at: sharedQuiz.created_at
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
      .eq('quiz_id', quizId)
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

export async function DELETE(request, { params }) {
  try {
    // 세션 확인
    const authOptions = createAuthOptions()
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = params
    const supabase = createServiceClient()

    // shared_quizzes에서 퀴즈 정보 확인
    const { data: sharedQuiz, error: sharedError } = await supabase
      .from('shared_quizzes')
      .select('quiz_id, user_email')
      .eq('id', id)
      .single()

    if (sharedError || !sharedQuiz) {
      return NextResponse.json(
        { error: '퀴즈를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    const quizId = sharedQuiz.quiz_id

    // 소유자만 삭제 가능
    if (sharedQuiz.user_email !== session.user.email) {
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
      .eq('quiz_id', quizId)

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
      .eq('quiz_id', quizId)

    // 3. 공유 퀴즈 삭제 (shared_quizzes ID로 삭제)
    await supabase
      .from('shared_quizzes')
      .delete()
      .eq('id', id)

    // 4. 퀴즈 삭제
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)

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