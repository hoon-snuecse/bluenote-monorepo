import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { createClient } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export async function POST(request, { params }) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = params
    const { format } = await request.json()

    const supabase = createClient()

    // 공유된 퀴즈 정보 가져오기
    const { data: sharedQuiz, error: sharedError } = await supabase
      .from('shared_quizzes')
      .select(`
        quiz:quizzes!inner (
          id,
          title,
          topic,
          description,
          questions (
            question_text,
            question_type,
            time_limit,
            explanation,
            question_options (
              option_text,
              is_correct,
              option_order
            )
          )
        )
      `)
      .eq('id', id)
      .single()

    if (sharedError || !sharedQuiz) {
      return NextResponse.json(
        { error: '퀴즈를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const quiz = sharedQuiz.quiz
    const questions = quiz.questions.map(q => ({
      question: q.question_text,
      type: q.question_type,
      timeLimit: q.time_limit,
      explanation: q.explanation,
      options: q.question_options
        .sort((a, b) => a.option_order - b.option_order)
        .map(opt => ({
          text: opt.option_text,
          isCorrect: opt.is_correct
        }))
    }))

    // 다운로드 카운트 증가 (별도 테이블 구현 필요)
    // await supabase.from('download_logs').insert({ ... })

    if (format === 'csv') {
      // CSV 형식으로 변환
      const headers = [
        'Question - max 95 characters',
        'Answer 1 - max 60 characters',
        'Answer 2 - max 60 characters',
        'Answer 3 - max 60 characters',
        'Answer 4 - max 60 characters',
        'Time limit (sec)',
        'Correct answer(s)'
      ]

      const rows = questions.map((question) => {
        const answers = ['', '', '', '']
        const correctAnswers = []

        question.options.forEach((option, index) => {
          if (index < 4) {
            answers[index] = option.text
            if (option.isCorrect) {
              correctAnswers.push(index + 1)
            }
          }
        })

        if (question.type === 'true_false') {
          answers[2] = ''
          answers[3] = ''
        }

        return [
          question.question.substring(0, 95),
          answers[0].substring(0, 60),
          answers[1].substring(0, 60),
          answers[2].substring(0, 60),
          answers[3].substring(0, 60),
          question.timeLimit || 30,
          correctAnswers.join(',')
        ]
      })

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      const BOM = '\uFEFF'
      const csvWithBOM = BOM + csvContent

      return new Response(csvWithBOM, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${quiz.title || 'quiz'}_kahoot.csv"`
        }
      })

    } else if (format === 'xlsx') {
      // Excel 형식으로 변환
      const wb = XLSX.utils.book_new()

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

      questions.forEach((question) => {
        const answers = ['', '', '', '']
        const correctAnswers = []

        question.options.forEach((option, index) => {
          if (index < 4) {
            answers[index] = option.text
            if (option.isCorrect) {
              correctAnswers.push(index + 1)
            }
          }
        })

        if (question.type === 'true_false') {
          answers[2] = ''
          answers[3] = ''
        }

        kahootData.push([
          question.question.substring(0, 95),
          answers[0].substring(0, 60),
          answers[1].substring(0, 60),
          answers[2].substring(0, 60),
          answers[3].substring(0, 60),
          question.timeLimit || 30,
          correctAnswers.join(',')
        ])
      })

      const ws = XLSX.utils.aoa_to_sheet(kahootData)
      XLSX.utils.book_append_sheet(wb, ws, 'Kahoot Quiz')

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

      return new Response(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${quiz.title || 'quiz'}_kahoot.xlsx"`
        }
      })
    }

    return NextResponse.json(
      { error: '지원하지 않는 형식입니다.' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: '다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}