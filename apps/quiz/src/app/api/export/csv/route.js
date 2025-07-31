import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getServerSession } from '@bluenote/auth'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questions, title, quizId } = await request.json()
    
    let questionsData = questions
    let quizTitle = title
    
    // quizId가 제공된 경우 데이터베이스에서 퀴즈 조회
    if (quizId && !questions) {
      const supabase = createClient()
      
      // 먼저 RLS 컨텍스트 설정
      if (session.user?.email) {
        await supabase.rpc('set_current_user_email', { 
          email: session.user.email 
        })
      }
      
      // 퀴즈 정보 조회 (직접 quizzes 테이블에서 조회)
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('title, is_shared')
        .eq('id', quizId)
        .single()
        
      if (quizError) {
        console.error('Quiz fetch error:', quizError)
        return NextResponse.json({ error: '퀴즈를 찾을 수 없습니다.' }, { status: 404 })
      }
      
      // 공유되지 않은 퀴즈이고 본인 퀴즈가 아닌 경우 접근 제한
      if (!quiz.is_shared) {
        // 본인 퀴즈인지 확인
        const { data: ownQuiz } = await supabase
          .from('quizzes')
          .select('id')
          .eq('id', quizId)
          .eq('user_email', session.user.email)
          .single()
          
        if (!ownQuiz) {
          return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
        }
      }
      
      quizTitle = quiz.title
      
      // 문항 조회
      const { data: questionsFromDb, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          question_options (*)
        `)
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true })
        
      if (questionsError) {
        console.error('Questions fetch error:', questionsError)
        return NextResponse.json({ error: '문항을 불러올 수 없습니다.' }, { status: 500 })
      }
      
      questionsData = questionsFromDb
    }
    
    console.log('Export CSV - processing questions:', questionsData?.length)
    console.log('First question structure:', questionsData?.[0])
    
    // 첫 번째 문항으로 데이터 구조 파악
    const sampleQuestion = questionsData?.[0]
    const isQuizBuilderFormat = sampleQuestion && 'question' in sampleQuestion
    const isCommunityFormat = sampleQuestion && 'question_text' in sampleQuestion

    // Kahoot CSV 형식 헤더
    const headers = [
      'Question - max 95 characters',
      'Answer 1 - max 60 characters',
      'Answer 2 - max 60 characters',
      'Answer 3 - max 60 characters',
      'Answer 4 - max 60 characters',
      'Time limit (sec)',
      'Correct answer(s)'
    ]

    // CSV 데이터 생성
    const rows = questionsData.map((question) => {
      const answers = ['', '', '', '']
      const correctAnswers = []

      // 선택지 채우기 - options 배열 확인
      if (question.options && Array.isArray(question.options)) {
        question.options.forEach((option, index) => {
          if (index < 4) {
            // 두 가지 데이터 구조 모두 지원
            if (isQuizBuilderFormat) {
              answers[index] = option.text || ''
              if (option.isCorrect) {
                correctAnswers.push(index + 1)
              }
            } else {
              answers[index] = option.option_text || ''
              if (option.is_correct) {
                correctAnswers.push(index + 1)
              }
            }
          }
        })
      }

      // OX형 문항의 경우 3,4번 선택지는 비워둠
      const questionType = question.type || question.question_type
      if (questionType === 'true_false') {
        answers[2] = ''
        answers[3] = ''
      }

      // 문제 텍스트 가져오기
      const questionText = isQuizBuilderFormat ? question.question : question.question_text
      const timeLimit = question.timeLimit || question.time_limit || 30
      
      return [
        (questionText || '').substring(0, 95),
        answers[0].substring(0, 60),
        answers[1].substring(0, 60),
        answers[2].substring(0, 60),
        answers[3].substring(0, 60),
        timeLimit,
        correctAnswers.join(',')
      ]
    })

    // CSV 문자열 생성
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // BOM 추가 (Excel에서 한글 깨짐 방지)
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent

    return new Response(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${quizTitle || 'quiz'}_kahoot.csv"`
      }
    })
  } catch (error) {
    console.error('Export CSV error:', error)
    return NextResponse.json(
      { error: 'CSV 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}