import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createAuthOptions } from '@bluenote/auth'
import { createClient } from '@/lib/supabase'

const authCallbacks = {
  async session({ session, token }) {
    if (session?.user && token?.sub) {
      session.user.id = token.sub
    }
    return session
  }
}

// GET: 특정 퀴즈 조회
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(createAuthOptions(authCallbacks))
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const supabase = createClient()
    
    // RLS 컨텍스트 설정
    await supabase.rpc('set_current_user_email', { 
      email: session.user.email 
    })

    // 퀴즈와 관련 데이터 조회
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (
          *,
          question_options (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
      }
      console.error('Error fetching quiz:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 문항 정렬
    quiz.questions.sort((a, b) => a.order_index - b.order_index)
    quiz.questions.forEach(question => {
      question.question_options.sort((a, b) => a.order_index - b.order_index)
    })

    return NextResponse.json({ data: quiz })
  } catch (error) {
    console.error('Error in GET /api/quizzes/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: 퀴즈 업데이트
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(createAuthOptions(authCallbacks))
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { title, description, tags, metadata } = body

    const supabase = createClient()
    
    // RLS 컨텍스트 설정
    await supabase.rpc('set_current_user_email', { 
      email: session.user.email 
    })

    // 퀴즈 소유권 확인
    const { data: existingQuiz, error: checkError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingQuiz) {
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 })
    }

    // 퀴즈 업데이트
    const updateData = {
      updated_at: new Date().toISOString()
    }
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (tags !== undefined) updateData.tags = tags
    if (metadata !== undefined) updateData.metadata = metadata

    const { data: updatedQuiz, error: updateError } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating quiz:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      data: updatedQuiz,
      message: '퀴즈가 성공적으로 업데이트되었습니다.'
    })
  } catch (error) {
    console.error('Error in PUT /api/quizzes/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: 퀴즈 삭제
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(createAuthOptions(authCallbacks))
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const supabase = createClient()
    
    // RLS 컨텍스트 설정
    await supabase.rpc('set_current_user_email', { 
      email: session.user.email 
    })

    // 퀴즈 소유권 확인
    const { data: existingQuiz, error: checkError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingQuiz) {
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 })
    }

    // 관련 데이터는 CASCADE로 자동 삭제됨
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting quiz:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: '퀴즈가 성공적으로 삭제되었습니다.'
    })
  } catch (error) {
    console.error('Error in DELETE /api/quizzes/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}