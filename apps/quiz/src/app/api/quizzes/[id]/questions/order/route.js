import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getServerSession } from '@/lib/auth'

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { questions } = body

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: '문항 목록이 필요합니다.' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // RLS 컨텍스트 설정
    if (session.user?.email) {
      await supabase.rpc('set_current_user_email', { 
        email: session.user.email 
      })
    }

    // 퀴즈 소유권 확인
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', id)
      .eq('user_email', session.user.email)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: '퀴즈를 찾을 수 없거나 권한이 없습니다.' },
        { status: 404 }
      )
    }

    // 각 문항의 순서 업데이트
    const updatePromises = questions.map(q => 
      supabase
        .from('questions')
        .update({ order_index: q.order_index })
        .eq('id', q.id)
        .eq('quiz_id', id)
    )

    const results = await Promise.all(updatePromises)
    
    // 에러 확인
    const hasError = results.some(result => result.error)
    if (hasError) {
      return NextResponse.json(
        { error: '문항 순서 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '문항 순서가 성공적으로 업데이트되었습니다.'
    })

  } catch (error) {
    return NextResponse.json(
      { error: '문항 순서 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}