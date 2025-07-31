import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quizId')
    
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    console.log('Fetching questions for quiz:', quizId)
    const supabase = createClient()
    
    // 임시로 RLS를 우회하기 위해 서비스 롤 사용 (보안상 주의 필요)
    // TODO: 적절한 RLS 정책으로 대체
    
    // 먼저 해당 퀴즈가 공유되었는지 확인
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('is_shared')
      .eq('id', quizId)
      .single()
      
    if (quizError || !quiz) {
      console.error('Quiz not found:', quizError)
      return NextResponse.json({ error: '퀴즈를 찾을 수 없습니다.' }, { status: 404 })
    }
    
    if (!quiz.is_shared) {
      return NextResponse.json({ error: '공유되지 않은 퀴즈입니다.' }, { status: 403 })
    }
    
    // 문항 조회
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_options (*)
      `)
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true })
    
    if (error) {
      console.error('Questions fetch error:', error)
      return NextResponse.json({ error: '문항을 불러올 수 없습니다.' }, { status: 500 })
    }
    
    console.log('Found questions:', questions?.length)
    return NextResponse.json({ questions: questions || [] })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}