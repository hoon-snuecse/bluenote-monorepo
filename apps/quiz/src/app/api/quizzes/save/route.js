import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase'

export async function POST(request) {
  try {
    // 세션 확인
    const session = await getServerSession()
    
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

    const supabase = createClient()

    // 퀴즈 메타데이터 저장
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        user_email: userEmail,
        title,
        topic: topic || '일반',
        description: `AI로 생성된 ${questions.length}개 문항`,
        total_questions: questions.length,
        metadata: {
          grade: grade || 'general',
          created_by: 'ai',
          ai_model: questions[0]?.metadata?.ai_model || 'claude'
        },
        status: 'published',
        is_public: true
      })
      .select()
      .single()

    if (quizError) {
      return NextResponse.json(
        { error: '퀴즈 저장 중 오류가 발생했습니다.', details: quizError.message },
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
    return NextResponse.json(
      { error: '퀴즈 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}