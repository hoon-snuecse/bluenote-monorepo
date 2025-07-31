import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getServerSession } from '@bluenote/auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { title, description } = body

    if (!title?.trim()) {
      return NextResponse.json(
        { error: '퀴즈 제목은 필수입니다.' },
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

    // 퀴즈 업데이트 (RLS 정책에 의해 본인 퀴즈만 업데이트 가능)
    const { data, error } = await supabase
      .from('quizzes')
      .update({
        title,
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_email', session.user.email)
      .select()
      .single()

    if (error || !data) {
      console.error('Quiz update error:', error)
      return NextResponse.json(
        { error: '퀴즈를 업데이트할 수 없습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: '퀴즈가 성공적으로 업데이트되었습니다.',
      quiz: data
    })

  } catch (error) {
    console.error('Update quiz error:', error)
    return NextResponse.json(
      { error: '퀴즈 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
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

    // 퀴즈 삭제 (RLS 정책에 의해 본인 퀴즈만 삭제 가능)
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Quiz delete error:', error)
      return NextResponse.json(
        { error: '퀴즈를 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: '퀴즈가 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Delete quiz error:', error)
    return NextResponse.json(
      { error: '퀴즈 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}