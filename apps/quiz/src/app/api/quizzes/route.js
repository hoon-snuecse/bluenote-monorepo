import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createAuthOptions } from '@bluenote/auth'
import { createClient } from '@/lib/supabase'

// GET: 사용자의 퀴즈 목록 조회
export async function GET(request) {
  try {
    const authOptions = createAuthOptions()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag') || ''

    const supabase = createClient()
    
    // RLS 컨텍스트 설정
    await supabase.rpc('set_current_user_email', { 
      email: session.user.email 
    })

    // 기본 쿼리
    let query = supabase
      .from('quizzes')
      .select('*, questions(count)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // 검색 조건 추가
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 태그 필터링
    if (tag) {
      query = query.contains('tags', [tag])
    }

    const { data: quizzes, error, count } = await query

    if (error) {
      console.error('Error fetching quizzes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: quizzes,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/quizzes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 새 퀴즈 생성
export async function POST(request) {
  try {
    const authOptions = createAuthOptions()
    const session = await getServerSession(authOptions)
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

    const supabase = createClient()
    
    // RLS 컨텍스트 설정
    await supabase.rpc('set_current_user_email', { 
      email: session.user.email 
    })

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
      console.error('Error creating quiz:', quizError)
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
      console.error('Error creating questions:', questionsError)
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
      console.error('Error creating options:', optionsError)
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
    console.error('Error in POST /api/quizzes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}