import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getServerSession } from '@/lib/auth'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const supabase = createClient()

    // RLS 컨텍스트 설정
    if (session.user?.email) {
      await supabase.rpc('set_current_user_email', { 
        email: session.user.email 
      })
    }


    // 1. 먼저 퀴즈 소유권 확인
    const { data: checkQuiz, error: checkError } = await supabase
      .from('quizzes')
      .select('id, user_email, is_shared')
      .eq('id', id)
      .single()

    if (checkError || !checkQuiz) {
      return NextResponse.json(
        { error: '퀴즈를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (checkQuiz.user_email !== session.user.email) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 2. is_shared 업데이트
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .update({ is_shared: true })
      .eq('id', id)
      .select()
      .single()

    if (quizError) {
      return NextResponse.json(
        { error: '퀴즈 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 2. shared_quizzes 테이블에 추가 (이미 있으면 업데이트)
    const { data: existingShare } = await supabase
      .from('shared_quizzes')
      .select('id')
      .eq('quiz_id', id)
      .single()

    if (existingShare) {
      // 이미 공유된 경우 - is_public을 true로 업데이트
      const { error: updateError } = await supabase
        .from('shared_quizzes')
        .update({ 
          is_public: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingShare.id)

      if (updateError) {
        // is_shared는 이미 true로 설정되었으므로 rollback 필요
        await supabase
          .from('quizzes')
          .update({ is_shared: false })
          .eq('id', id)
        
        return NextResponse.json(
          { error: '퀴즈 공유 중 오류가 발생했습니다.' },
          { status: 500 }
        )
      }
    } else {
      // 새로 공유하는 경우
      const { data: questions } = await supabase
        .from('questions')
        .select('question_type')
        .eq('quiz_id', id)

      const true_false_count = questions?.filter(q => q.question_type === 'true_false').length || 0
      const multiple_choice_count = questions?.filter(q => q.question_type === 'multiple_choice').length || 0

      const { error: insertError } = await supabase
        .from('shared_quizzes')
        .insert({
          quiz_id: id,
          user_email: session.user.email,
          title: quiz.title,
          description: quiz.description,
          subject_category: quiz.subject_category,
          grade_level: quiz.grade_level,
          total_questions: questions?.length || 0,
          true_false_count,
          multiple_choice_count,
          is_public: true
        })

      if (insertError) {
        // is_shared는 이미 true로 설정되었으므로 rollback 필요
        await supabase
          .from('quizzes')
          .update({ is_shared: false })
          .eq('id', id)
        
        return NextResponse.json(
          { error: '퀴즈 공유 중 오류가 발생했습니다.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: '퀴즈가 성공적으로 공유되었습니다.',
      quiz: {
        id: quiz.id,
        title: quiz.title,
        is_shared: true
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: '퀴즈 공유 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const supabase = createClient()

    // RLS 컨텍스트 설정
    if (session.user?.email) {
      await supabase.rpc('set_current_user_email', { 
        email: session.user.email 
      })
    }


    // 1. 먼저 퀴즈 소유권 확인
    const { data: checkQuiz, error: checkError } = await supabase
      .from('quizzes')
      .select('id, user_email, is_shared')
      .eq('id', id)
      .single()

    if (checkError || !checkQuiz) {
      return NextResponse.json(
        { error: '퀴즈를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (checkQuiz.user_email !== session.user.email) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 2. is_shared 업데이트
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .update({ is_shared: false })
      .eq('id', id)
      .select()
      .single()

    if (quizError) {
      return NextResponse.json(
        { error: '퀴즈 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 2. shared_quizzes에서 is_public을 false로 설정 (완전 삭제하지 않음 - 통계 보존)
    const { error: updateError } = await supabase
      .from('shared_quizzes')
      .update({ 
        is_public: false,
        updated_at: new Date().toISOString()
      })
      .eq('quiz_id', id)

    if (updateError) {
      // is_shared는 이미 false로 설정되었으므로 rollback 필요
      await supabase
        .from('quizzes')
        .update({ is_shared: true })
        .eq('id', id)
      
      return NextResponse.json(
        { error: '퀴즈 공유 취소 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '퀴즈 공유가 취소되었습니다.',
      quiz: {
        id: quiz.id,
        title: quiz.title,
        is_shared: false
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: '퀴즈 공유 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}