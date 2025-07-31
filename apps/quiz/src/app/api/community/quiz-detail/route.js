import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sharedQuizId = searchParams.get('id')
    
    if (!sharedQuizId) {
      return NextResponse.json({ error: 'Shared Quiz ID is required' }, { status: 400 })
    }

    console.log('Fetching shared quiz detail for id:', sharedQuizId)
    // 서비스 롤을 사용하여 RLS 우회
    const supabase = createServiceClient()
    
    // shared_quizzes와 quizzes를 join해서 가져오기
    const { data: sharedQuiz, error: sharedError } = await supabase
      .from('shared_quizzes')
      .select(`
        *,
        quiz:quizzes!inner (
          id,
          title,
          description,
          user_email,
          is_shared,
          created_at,
          updated_at
        )
      `)
      .eq('id', sharedQuizId)
      .single()
      
    if (sharedError || !sharedQuiz) {
      console.error('Shared quiz not found:', sharedError)
      return NextResponse.json({ error: '퀴즈를 찾을 수 없습니다.' }, { status: 404 })
    }
    
    // is_shared가 true인지 확인
    if (!sharedQuiz.quiz?.is_shared) {
      return NextResponse.json({ error: '공유되지 않은 퀴즈입니다.' }, { status: 403 })
    }
    
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