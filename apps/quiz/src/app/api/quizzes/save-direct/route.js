import { NextResponse } from 'next/server'
import { getSession } from '@bluenote/supabase-auth/server'
import { createClient } from '@supabase/supabase-js'

// 직접 Supabase 클라이언트 생성 (디버깅용)
function createDirectClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('[save-direct] Creating client with:', {
    url: supabaseUrl,
    keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service' : 'anon',
    keyLength: supabaseKey?.length
  })
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  })
}

export async function POST(request) {
  try {
    // 세션 확인
    const session = await getSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }
    
    const userEmail = session.user.email
    const { questions, title, topic, grade } = await request.json()

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: '퀴즈 제목과 문항이 필요합니다.' }, { status: 400 })
    }

    // 직접 생성한 클라이언트 사용
    const supabase = createDirectClient()
    
    // RLS 우회를 위한 raw SQL 실행
    const { data: quiz, error: quizError } = await supabase.rpc('create_quiz_with_bypass', {
      p_user_email: userEmail,
      p_title: title,
      p_topic: topic || '일반',
      p_description: `AI로 생성된 ${questions.length}개 문항`,
      p_total_questions: questions.length,
      p_metadata: {
        grade: grade || 'general',
        created_by: 'ai',
        ai_model: questions[0]?.metadata?.ai_model || 'claude'
      }
    })

    if (quizError) {
      console.error('[save-direct] RPC error:', quizError)
      
      // RPC가 없으면 직접 INSERT 시도
      const { data: directQuiz, error: directError } = await supabase
        .from('quizzes')
        .insert({
          user_email: userEmail,
          title,
          topic: topic || '일반',
          description: `AI로 생성된 ${questions.length}개 문항`,
          total_questions: questions.length,
          metadata: {
            grade: grade || 'general',
            created_by: 'ai'
          },
          status: 'published',
          is_public: true,
          is_shared: true,
          is_sample: false,
          tags: []
        })
        .select()
        .single()
      
      if (directError) {
        return NextResponse.json({
          error: '퀴즈 저장 중 오류가 발생했습니다.',
          details: directError.message,
          code: directError.code
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        quizId: directQuiz.id,
        message: '퀴즈가 성공적으로 저장되었습니다.'
      })
    }

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      message: '퀴즈가 성공적으로 저장되었습니다.'
    })

  } catch (error) {
    console.error('[save-direct] Unexpected error:', error)
    return NextResponse.json({ 
      error: '퀴즈 저장 중 오류가 발생했습니다.',
      details: error.message 
    }, { status: 500 })
  }
}