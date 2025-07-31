import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sharedQuizId = searchParams.get('id')
    
    console.log('API called with params:', { sharedQuizId })
    
    if (!sharedQuizId) {
      return NextResponse.json({ error: 'Shared Quiz ID is required' }, { status: 400 })
    }

    console.log('Fetching shared quiz detail for id:', sharedQuizId)
    // 일반 클라이언트 사용 (shared_quizzes는 누구나 볼 수 있음)
    const supabase = createClient()
    
    // 먼저 shared_quizzes 정보 가져오기
    const { data: sharedQuiz, error: sharedError } = await supabase
      .from('shared_quizzes')
      .select('*')
      .eq('id', sharedQuizId)
      .single()
      
    if (sharedError || !sharedQuiz) {
      console.error('Shared quiz not found:', sharedError)
      return NextResponse.json({ error: '퀴즈를 찾을 수 없습니다.' }, { status: 404 })
    }
    
    console.log('Found shared quiz:', sharedQuiz)
    
    // quiz_id로 퀴즈 정보 가져오기
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', sharedQuiz.quiz_id)
      .single()
      
    if (quizError || !quizData) {
      console.error('Quiz not found:', quizError)
      return NextResponse.json({ error: '퀴즈 정보를 찾을 수 없습니다.' }, { status: 404 })
    }
    
    // is_shared가 true인지 확인
    if (!quizData.is_shared) {
      return NextResponse.json({ error: '공유되지 않은 퀴즈입니다.' }, { status: 403 })
    }
    
    // sharedQuiz에 quiz 정보 추가
    sharedQuiz.quiz = quizData
    
    // 문항 조회
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        *,
        question_options (*)
      `)
      .eq('quiz_id', sharedQuiz.quiz_id)
      .order('order_index', { ascending: true })
    
    if (questionsError) {
      console.error('Questions fetch error:', questionsError)
      // 문항 조회 실패해도 퀴즈 정보는 반환
      return NextResponse.json({ 
        sharedQuiz,
        questions: []
      })
    }
    
    console.log('Found questions:', questions?.length)
    
    return NextResponse.json({ 
      sharedQuiz,
      questions: questions || []
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}