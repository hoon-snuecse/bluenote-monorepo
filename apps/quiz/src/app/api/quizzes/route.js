import { NextResponse } from 'next/server'
import { getSession } from '@bluenote/supabase-auth/server'
import { createClient } from '@supabase/supabase-js'

// Admin 클라이언트 생성 (RLS가 비활성화되어 있으므로 ANON KEY 사용 가능)
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Service Role Key가 없으면 ANON Key 사용 (RLS가 비활성화되어 있으므로 작동함)
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// GET: 사용자의 퀴즈 목록 조회
export async function GET(request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag') || ''

    // Service Role 클라이언트 사용 (RLS 우회)
    const supabase = createAdminClient()

    // 내 퀴즈와 샘플 퀴즈를 분리하여 조회
    const [myQuizzesResult, sampleQuizzesResult] = await Promise.all([
      // 내 퀴즈 조회
      supabase
        .from('quizzes')
        .select('*, questions(count)', { count: 'exact' })
        .eq('user_email', session.user.email)
        .eq('is_sample', false)
        .or(search ? `title.ilike.%${search}%,description.ilike.%${search}%` : undefined)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1),
      
      // 샘플 퀴즈 조회 (페이지네이션 없이)
      supabase
        .from('quizzes')
        .select('*, questions(count)')
        .eq('is_sample', true)
        .order('sample_order', { ascending: true })
    ])

    const { data: myQuizzes, error: myError, count } = myQuizzesResult
    const { data: sampleQuizzes, error: sampleError } = sampleQuizzesResult

    if (myError || sampleError) {
      return NextResponse.json({ 
        error: (myError || sampleError).message 
      }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        myQuizzes: myQuizzes || [],
        sampleQuizzes: sampleQuizzes || []
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 새 퀴즈 생성
export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, questions, tags, metadata } = body

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ 
        error: 'Title and at least one question are required' 
      }, { status: 400 })
    }

    // Service Role 클라이언트 사용 (RLS 우회)
    const supabase = createAdminClient()

    // 트랜잭션 시작
    // 1. 퀴즈 생성
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title,
        description,
        user_email: session.user.email,
        tags: tags || [],
        metadata: metadata || {},
        total_questions: questions.length
      })
      .select()
      .single()

    if (quizError) {
      return NextResponse.json({ error: quizError.message }, { status: 500 })
    }

    // 2. 문항들 생성
    const questionsToInsert = questions.map((q, index) => ({
      quiz_id: quiz.id,
      question_text: q.question,
      question_type: q.type,
      time_limit: q.timeLimit || 30,
      points: q.points || 1000,
      order_index: index,
      explanation: q.explanation || null,
      metadata: q.metadata || {}
    }))

    const { data: createdQuestions, error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select()

    if (questionsError) {
      // 퀴즈 삭제 (롤백)
      await supabase.from('quizzes').delete().eq('id', quiz.id)
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }

    // 3. 선택지들 생성
    const optionsToInsert = []
    createdQuestions.forEach((question, qIndex) => {
      const originalQuestion = questions[qIndex]
      originalQuestion.options.forEach((option, oIndex) => {
        optionsToInsert.push({
          question_id: question.id,
          option_text: option.text,
          is_correct: option.isCorrect,
          order_index: oIndex
        })
      })
    })

    const { error: optionsError } = await supabase
      .from('question_options')
      .insert(optionsToInsert)

    if (optionsError) {
      // 문항과 퀴즈 삭제 (롤백)
      await supabase.from('questions').delete().eq('quiz_id', quiz.id)
      await supabase.from('quizzes').delete().eq('id', quiz.id)
      return NextResponse.json({ error: optionsError.message }, { status: 500 })
    }

    // 4. 일일 통계 업데이트
    await supabase.rpc('increment_daily_stat', {
      stat_date: new Date().toISOString().split('T')[0],
      quizzes_created: 1
    })

    return NextResponse.json({
      data: {
        ...quiz,
        questions: createdQuestions.map((q, index) => ({
          ...q,
          options: questions[index].options
        }))
      },
      message: '퀴즈가 성공적으로 생성되었습니다.'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}