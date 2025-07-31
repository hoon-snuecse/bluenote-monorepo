import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quizId')
    
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    const supabase = createClient()
    
    // 서비스 역할로 직접 조회 (RLS 우회)
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_options (*)
      `)
      .eq('quiz_id', quizId)
      .order('question_order', { ascending: true })
    
    if (error) {
      console.error('Questions fetch error:', error)
      return NextResponse.json({ error: '문항을 불러올 수 없습니다.' }, { status: 500 })
    }
    
    return NextResponse.json({ questions: questions || [] })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}