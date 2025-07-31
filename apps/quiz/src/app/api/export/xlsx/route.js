import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
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
      
      // 퀴즈 정보 조회 (공유된 퀴즈도 조회 가능)
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('title')
        .eq('id', quizId)
        .single()
        
      if (quizError) {
        console.error('Quiz fetch error:', quizError)
        return NextResponse.json({ error: '퀴즈를 찾을 수 없습니다.' }, { status: 404 })
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
        .order('question_order', { ascending: true })
        
      if (questionsError) {
        console.error('Questions fetch error:', questionsError)
        return NextResponse.json({ error: '문항을 불러올 수 없습니다.' }, { status: 500 })
      }
      
      questionsData = questionsFromDb
    }
    
    console.log('Export XLSX - processing questions:', questionsData?.length)
    console.log('First question structure:', questionsData?.[0])
    
    // 첫 번째 문항으로 데이터 구조 파악
    const sampleQuestion = questionsData?.[0]
    const isQuizBuilderFormat = sampleQuestion && 'question' in sampleQuestion

    // 워크북 생성
    const wb = XLSX.utils.book_new()

    // Kahoot 형식 데이터 준비
    const kahootData = [
      [
        'Question - max 95 characters',
        'Answer 1 - max 60 characters',
        'Answer 2 - max 60 characters',
        'Answer 3 - max 60 characters',
        'Answer 4 - max 60 characters',
        'Time limit (sec)',
        'Correct answer(s)'
      ]
    ]

    questionsData.forEach((question) => {
      const answers = ['', '', '', '']
      const correctAnswers = []

      // 선택지 채우기
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
      
      kahootData.push([
        (questionText || '').substring(0, 95),
        answers[0].substring(0, 60),
        answers[1].substring(0, 60),
        answers[2].substring(0, 60),
        answers[3].substring(0, 60),
        timeLimit,
        correctAnswers.join(',')
      ])
    })

    // Kahoot 시트 생성
    const ws = XLSX.utils.aoa_to_sheet(kahootData)
    XLSX.utils.book_append_sheet(wb, ws, 'Kahoot Quiz')

    // 상세 정보 시트 추가 (선택사항)
    const detailData = [
      ['번호', '문제', '유형', '난이도', '시간제한', '정답', '해설']
    ]

    questionsData.forEach((question, index) => {
      let correctAnswer = ''
      
      if (question.options && Array.isArray(question.options)) {
        if (isQuizBuilderFormat) {
          correctAnswer = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.text)
            .join(', ')
        } else {
          correctAnswer = question.options
            .filter(opt => opt.is_correct)
            .map(opt => opt.option_text)
            .join(', ')
        }
      }
      
      const questionText = isQuizBuilderFormat ? question.question : question.question_text
      const questionType = question.type || question.question_type
      const timeLimit = question.timeLimit || question.time_limit || 30
      const explanation = question.explanation || ''

      detailData.push([
        index + 1,
        questionText || '',
        questionType === 'true_false' ? 'OX형' : '4지선다형',
        question.metadata?.difficulty === 'hard' ? '상' : 
         question.metadata?.difficulty === 'medium' ? '중' : '하',
        `${timeLimit}초`,
        correctAnswer,
        explanation
      ])
    })

    const detailWs = XLSX.utils.aoa_to_sheet(detailData)
    XLSX.utils.book_append_sheet(wb, detailWs, '상세정보')

    // Excel 파일 생성
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

    return new Response(Buffer.from(excelBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${quizTitle || 'quiz'}_kahoot.xlsx"`
      }
    })
  } catch (error) {
    console.error('Export XLSX error:', error)
    return NextResponse.json(
      { error: 'Excel 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}