import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'recent'
    const category = searchParams.get('category') || 'all'
    const grade = searchParams.get('grade') || 'all'

    const supabase = createClient()

    // 기본 쿼리
    let query = supabase
      .from('shared_quizzes')
      .select(`
        id,
        created_at,
        user_email,
        title,
        description,
        subject_category,
        grade_level,
        total_questions,
        true_false_count,
        multiple_choice_count,
        download_count,
        rating_average,
        rating_count
      `)
      .eq('is_public', true)

    // 카테고리 필터
    if (category !== 'all') {
      query = query.eq('subject_category', category)
    }

    // 학년 필터
    if (grade !== 'all') {
      query = query.eq('grade_level', grade)
    }

    // 정렬
    switch (sort) {
      case 'popular':
        query = query.order('download_count', { ascending: false })
        break
      case 'rating':
        query = query.order('rating_average', { ascending: false })
        break
      case 'downloads':
        query = query.order('download_count', { ascending: false })
        break
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data: sharedQuizzes, error } = await query.limit(50)

    if (error) {
      console.error('Error fetching community quizzes:', error)
      return NextResponse.json(
        { error: '커뮤니티 퀴즈를 불러오는 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    // 응답 형식 정리 (이미 shared_quizzes에 모든 정보가 있음)
    const formattedQuizzes = sharedQuizzes.map(sq => ({
      id: sq.id,
      title: sq.title,
      description: sq.description,
      total_questions: sq.total_questions,
      true_false_count: sq.true_false_count,
      multiple_choice_count: sq.multiple_choice_count,
      subject_category: sq.subject_category,
      grade_level: sq.grade_level,
      user_name: sq.user_email?.split('@')[0] || '익명', // 이메일에서 사용자명 추출
      created_at: sq.created_at,
      download_count: sq.download_count || 0,
      rating_average: sq.rating_average || 0,
      rating_count: sq.rating_count || 0
    }))

    return NextResponse.json({ quizzes: formattedQuizzes })

  } catch (error) {
    console.error('Community quizzes error:', error)
    return NextResponse.json(
      { error: '커뮤니티 퀴즈를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}