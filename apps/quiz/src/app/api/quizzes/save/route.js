import { NextResponse } from 'next/server'
import { getSession } from '@bluenote/supabase-auth/server'
import { createClient } from '@/lib/supabase'

export async function POST(request) {
  try {
    // 세션 확인
    const session = await getSession()
    
    if (!session?.user?.email) {
      console.log('[save quiz] No session found')
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    console.log('[save quiz] Authenticated user:', session.user.email)
    const userEmail = session.user.email

    const { questions, title, topic, grade } = await request.json()

    // 유효성 검증
    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: '퀴즈 제목과 문항이 필요합니다.' },
        { status: 400 }
      )
    }

    // 일반 클라이언트 사용
    const supabase = createClient()
    
    // RLS 컨텍스트 설정을 위한 직접 SQL 실행
    console.log('[save quiz] Setting RLS context for user:', userEmail)
    const { data: setContextData, error: setContextError } = await supabase
      .rpc('set_current_user_email', { email: userEmail })
    
    if (setContextError) {
      console.error('[save quiz] Failed to set RLS context:', setContextError)
      // 에러가 나도 계속 진행
    }
    
    console.log('[save quiz] RLS context set result:', setContextData)
    
    // 퀴즈 메타데이터 저장
    console.log('[save quiz] Attempting to save quiz with user_email:', userEmail)
    
    // /api/quizzes의 POST와 동일한 방식으로 시도
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title,
        description: `AI로 생성된 ${questions.length}개 문항`,
        user_email: userEmail,
        tags: [],
        metadata: {
          grade: grade || 'general',
          created_by: 'ai',
          ai_model: questions[0]?.metadata?.ai_model || 'claude'
        },
        total_questions: questions.length,
        topic: topic || '일반',
        status: 'published',
        is_public: true,
        is_shared: true,
        is_sample: false
      })
      .select()
      .single()

    if (quizError) {
      console.error('[save quiz] Quiz insert error:', {
        message: quizError.message,
        code: quizError.code,
        details: quizError.details,
        hint: quizError.hint
      })
      return NextResponse.json(
        { 
          error: '퀴즈 저장 중 오류가 발생했습니다.', 
          details: quizError.message,
          code: quizError.code,
          hint: quizError.hint
        },
        { status: 500 }
      )
    }

    // 문항 저장
    const questionsToInsert = questions.map((q, index) => ({
      quiz_id: quiz.id,
      question_text: q.question,
      question_type: q.type,
      difficulty: q.metadata?.difficulty || 'medium',
      time_limit: q.timeLimit || 30,
      points: 1000,
      explanation: q.explanation || null,
      metadata: q.metadata || {},
      order_index: index + 1
    }))

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert)

    if (questionsError) {
      // 실패 시 퀴즈도 삭제
      await supabase.from('quizzes').delete().eq('id', quiz.id)
      return NextResponse.json(
        { error: '문항 저장 중 오류가 발생했습니다.', details: questionsError.message },
        { status: 500 }
      )
    }

    // 선택지 저장
    const optionsToInsert = []
    questions.forEach((q, qIndex) => {
      const questionId = questionsToInsert[qIndex].quiz_id
      q.options.forEach((opt, optIndex) => {
        optionsToInsert.push({
          question_id: questionId,
          option_text: opt.text,
          order_index: optIndex,  // 0-3 범위
          is_correct: opt.isCorrect
        })
      })
    })

    // 문항 ID 조회
    const { data: savedQuestions } = await supabase
      .from('questions')
      .select('id, order_index')
      .eq('quiz_id', quiz.id)
      .order('order_index')

    if (savedQuestions) {
      const finalOptions = []
      savedQuestions.forEach((sq, index) => {
        questions[index].options.forEach((opt, optIndex) => {
          finalOptions.push({
            question_id: sq.id,
            option_text: opt.text,
            order_index: optIndex,  // 0-3 범위
            is_correct: opt.isCorrect
          })
        })
      })

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(finalOptions)

      if (optionsError) {
        // Options insertion error
      }
    }

    // 커뮤니티에 공유
    const truefalseCount = questions.filter(q => q.type === 'true_false').length
    const multipleChoiceCount = questions.filter(q => q.type === 'multiple_choice').length
    
    const { error: shareError } = await supabase
      .from('shared_quizzes')
      .insert({
        quiz_id: quiz.id,
        user_email: userEmail,
        title: quiz.title,
        description: quiz.description,
        subject_category: topic || '일반',
        grade_level: grade || 'general',
        total_questions: questions.length,
        true_false_count: truefalseCount,
        multiple_choice_count: multipleChoiceCount,
        tags: [],
        is_public: true,
        visibility: 'public'
      })

    if (shareError) {
      // Share error
    }

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      message: '퀴즈가 성공적으로 저장되었습니다.'
    })

  } catch (error) {
    console.error('[save quiz] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: '퀴즈 저장 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}