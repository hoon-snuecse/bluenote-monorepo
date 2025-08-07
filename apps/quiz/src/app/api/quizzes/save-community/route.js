import { NextResponse } from 'next/server'
import { getSession } from '@bluenote/supabase-auth/server'
import { createClient } from '@supabase/supabase-js'

// Admin 클라이언트 생성 (RLS가 비활성화되어 있으므로 ANON KEY 사용 가능)
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Service Role Key가 없으면 ANON Key 사용 (RLS가 비활성화되어 있으므로 작동함)
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  
  if (!supabaseKey) {
    console.error('[save-community] No Supabase key available')
    throw new Error('Missing Supabase credentials')
  }
  
  console.log('[save-community] Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON')
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request) {
  try {
    // Supabase Auth 세션 확인
    const session = await getSession()
    
    if (!session?.user?.email) {
      console.log('[save-community] No session found')
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    console.log('[save-community] Authenticated user:', session.user.email)
    const userEmail = session.user.email

    const { questions, title, topic, grade } = await request.json()

    // 유효성 검증
    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: '퀴즈 제목과 문항이 필요합니다.' },
        { status: 400 }
      )
    }

    // Service Role 클라이언트 사용 (RLS 우회)
    console.log('[save-community] Creating admin client')
    let supabase
    try {
      supabase = createAdminClient()
    } catch (error) {
      console.error('[save-community] Failed to create admin client:', error.message)
      return NextResponse.json(
        { 
          error: 'Server configuration error', 
          details: error.message,
          hint: 'Service Role Key may not be configured in production environment'
        },
        { status: 500 }
      )
    }

    // 퀴즈 메타데이터 저장
    console.log('[save-community] Inserting quiz data')
    console.log('[save-community] Using Service Role Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
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
        is_public: true,
        is_shared: true,
        is_sample: false,
        tags: []
      })
      .select()
      .single()

    if (quizError) {
      console.error('[save-community] Quiz insert error:', quizError)
      return NextResponse.json(
        { 
          error: '퀴즈 저장 중 오류가 발생했습니다.', 
          details: quizError.message,
          code: quizError.code
        },
        { status: 500 }
      )
    }

    console.log('[save-community] Quiz created:', quiz.id)

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
      console.error('[save-community] Questions insert error:', questionsError)
      // 실패 시 퀴즈도 삭제
      await supabase.from('quizzes').delete().eq('id', quiz.id)
      return NextResponse.json(
        { error: '문항 저장 중 오류가 발생했습니다.', details: questionsError.message },
        { status: 500 }
      )
    }

    // 선택지 저장
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
            order_index: optIndex,
            is_correct: opt.isCorrect
          })
        })
      })

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(finalOptions)

      if (optionsError) {
        console.error('[save-community] Options insert error:', optionsError)
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
      console.error('[save-community] Share error:', shareError)
    }

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      message: '퀴즈가 성공적으로 저장되었습니다.'
    })

  } catch (error) {
    console.error('[save-community] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: '퀴즈 저장 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}