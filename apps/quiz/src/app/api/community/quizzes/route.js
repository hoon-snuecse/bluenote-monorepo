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
        quiz:quizzes!inner (
          id,
          title,
          topic,
          description,
          total_questions,
          metadata,
          user:users!inner (
            name,
            email
          )
        )
      `)
      .eq('visibility', 'public')

    // 카테고리 필터
    if (category !== 'all') {
      query = query.eq('quiz.metadata->>subject_category', category)
    }

    // 학년 필터
    if (grade !== 'all') {
      query = query.eq('quiz.metadata->>grade', grade)
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
        { error: '커뮤니티 퀴즈를 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 각 퀴즈에 대한 추가 정보 조회
    const quizIds = sharedQuizzes.map(sq => sq.quiz.id)
    
    // 문항 유형별 개수 조회
    const { data: questionStats } = await supabase
      .from('questions')
      .select('quiz_id, question_type')
      .in('quiz_id', quizIds)

    // 통계 정보 계산
    const statsMap = {}
    questionStats?.forEach(q => {
      if (!statsMap[q.quiz_id]) {
        statsMap[q.quiz_id] = { true_false: 0, multiple_choice: 0 }
      }
      if (q.question_type === 'true_false') {
        statsMap[q.quiz_id].true_false++
      } else {
        statsMap[q.quiz_id].multiple_choice++
      }
    })

    // 응답 형식 정리
    const formattedQuizzes = sharedQuizzes.map(sq => ({
      id: sq.id,
      quiz_id: sq.quiz.id,
      title: sq.quiz.title,
      description: sq.quiz.description,
      topic: sq.quiz.topic,
      total_questions: sq.quiz.total_questions,
      true_false_count: statsMap[sq.quiz.id]?.true_false || 0,
      multiple_choice_count: statsMap[sq.quiz.id]?.multiple_choice || 0,
      subject_category: sq.quiz.metadata?.subject_category,
      grade_level: sq.quiz.metadata?.grade === 'middle1' ? '중1' :
                   sq.quiz.metadata?.grade === 'middle2' ? '중2' :
                   sq.quiz.metadata?.grade === 'middle3' ? '중3' :
                   sq.quiz.metadata?.grade === 'elementary' ? '초등' :
                   sq.quiz.metadata?.grade === 'high' ? '고등' : '일반',
      user_name: sq.quiz.user.name,
      created_at: sq.created_at,
      download_count: 0, // 실제 구현 시 별도 테이블에서 조회
      rating_average: 4.5, // 실제 구현 시 별도 테이블에서 조회
      rating_count: 10 // 실제 구현 시 별도 테이블에서 조회
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