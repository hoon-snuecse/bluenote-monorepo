import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getServerSession } from '@bluenote/auth'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'recent'
    const category = searchParams.get('category') || 'all'
    const grade = searchParams.get('grade') || 'all'

    const supabase = createClient()
    
    // 현재 사용자 세션 가져오기
    const session = await getServerSession(authOptions)
    const currentUserEmail = session?.user?.email

    // 1. 공개된 퀴즈 또는 본인 퀴즈 가져오기 (shared_quizzes에서)
    let sharedQuery = supabase
      .from('shared_quizzes')
      .select(`
        id,
        quiz_id,
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
        rating_count,
        is_public
      `)

    // 공개 퀴즈 또는 본인 퀴즈만 가져오기
    if (currentUserEmail) {
      sharedQuery = sharedQuery.or(`is_public.eq.true,user_email.eq.${currentUserEmail}`)
    } else {
      sharedQuery = sharedQuery.eq('is_public', true)
    }

    // 카테고리 필터
    if (category !== 'all') {
      sharedQuery = sharedQuery.eq('subject_category', category)
    }

    // 학년 필터
    if (grade !== 'all') {
      sharedQuery = sharedQuery.eq('grade_level', grade)
    }

    const { data: sharedQuizzes, error: sharedError } = await sharedQuery

    if (sharedError) {
      console.error('Error fetching shared quizzes:', sharedError)
    }

    // 2. 본인 퀴즈 가져오기 (공유 여부 상관없이)
    let myQuizzes = []
    if (currentUserEmail) {
      let myQuery = supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          created_at,
          user_email,
          is_shared,
          is_sample,
          subject_category,
          grade_level,
          questions (
            question_type
          )
        `)
        .eq('user_email', currentUserEmail)
        .eq('is_sample', false)

      // 카테고리 필터
      if (category !== 'all') {
        myQuery = myQuery.eq('subject_category', category)
      }

      // 학년 필터
      if (grade !== 'all') {
        myQuery = myQuery.eq('grade_level', grade)
      }

      const { data, error: myError } = await myQuery

      if (myError) {
        console.error('Error fetching my quizzes:', myError)
      } else if (data) {
        // 내 퀴즈 데이터 포맷팅
        myQuizzes = data.map(quiz => {
          const questions = quiz.questions || []
          const true_false_count = questions.filter(q => q.question_type === 'true_false').length
          const multiple_choice_count = questions.filter(q => q.question_type === 'multiple_choice').length

          return {
            id: quiz.id, // 퀴즈 ID 직접 사용
            quiz_id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            total_questions: questions.length,
            true_false_count,
            multiple_choice_count,
            subject_category: quiz.subject_category,
            grade_level: quiz.grade_level,
            user_email: quiz.user_email,
            user_name: quiz.user_email?.split('@')[0] || '익명',
            created_at: quiz.created_at,
            download_count: 0, // 내 퀴즈는 개별 다운로드 수 없음
            rating_average: 0,
            rating_count: 0,
            is_shared: quiz.is_shared,
            is_mine: true // 내 퀴즈 표시
          }
        })
      }
    }

    // 3. 공개 퀴즈와 내 퀴즈 병합 (중복 제거)
    const sharedQuizIds = new Set((sharedQuizzes || []).map(q => q.quiz_id))
    
    // 공유 퀴즈 포맷팅
    const formattedSharedQuizzes = (sharedQuizzes || []).map(sq => ({
      id: sq.id,
      quiz_id: sq.quiz_id,
      title: sq.title,
      description: sq.description,
      total_questions: sq.total_questions,
      true_false_count: sq.true_false_count,
      multiple_choice_count: sq.multiple_choice_count,
      subject_category: sq.subject_category,
      grade_level: sq.grade_level,
      user_email: sq.user_email,
      user_name: sq.user_email?.split('@')[0] || '익명',
      created_at: sq.created_at,
      download_count: sq.download_count || 0,
      rating_average: sq.rating_average || 0,
      rating_count: sq.rating_count || 0,
      is_shared: sq.is_public,
      is_mine: sq.user_email === currentUserEmail
    }))

    // 내 퀴즈 중 shared_quizzes에 없는 것들만 추가
    const myPrivateQuizzes = myQuizzes.filter(q => !sharedQuizIds.has(q.quiz_id))
    
    // 모든 퀴즈 합치기
    let allQuizzes = [...formattedSharedQuizzes, ...myPrivateQuizzes]

    // 정렬
    switch (sort) {
      case 'popular':
        allQuizzes.sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
        break
      case 'rating':
        allQuizzes.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0))
        break
      case 'downloads':
        allQuizzes.sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
        break
      case 'recent':
      default:
        allQuizzes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return NextResponse.json({ quizzes: allQuizzes })

  } catch (error) {
    console.error('Community quizzes error:', error)
    return NextResponse.json(
      { error: '커뮤니티 퀴즈를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}