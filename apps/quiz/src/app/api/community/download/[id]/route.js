import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
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

    const supabase = createServiceClient()

    // 먼저 shared_quizzes에서 실제 quiz_id 가져오기
    const { data: sharedQuiz, error: sharedError } = await supabase
      .from('shared_quizzes')
      .select('quiz_id, title, description, download_count')
      .eq('id', id)
      .single()

    if (sharedError || !sharedQuiz) {
      return NextResponse.json(
        { error: '공유된 퀴즈를 찾을 수 없습니다.', details: sharedError?.message },
        { status: 404 }
      )
    }

    const quizId = sharedQuiz.quiz_id
    const quiz = {
      id: quizId,
      title: sharedQuiz.title,
      description: sharedQuiz.description
    }

    // 문항 정보 가져오기
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        question_type,
        time_limit,
        explanation,
        order_index
      `)
      .eq('quiz_id', quizId)
      .order('order_index')

    if (questionsError) {
      return NextResponse.json(
        { error: '문항을 불러올 수 없습니다.', details: questionsError.message },
        { status: 500 }
      )
    }

    // 각 문항의 선택지 가져오기
    const questionIds = questions.map(q => q.id)
    const { data: options } = await supabase
      .from('question_options')
      .select('*')
      .in('question_id', questionIds)
      .order('order_index')

    // 문항과 선택지 매핑
    const questionsWithOptions = questions.map(q => ({
      ...q,
      question_options: options.filter(opt => opt.question_id === q.id)
    }))
    const formattedQuestions = questionsWithOptions.map(q => ({
      question: q.question_text,
      type: q.question_type,
      timeLimit: q.time_limit,
      explanation: q.explanation,
      options: q.question_options
        .sort((a, b) => a.order_index - b.order_index)
        .map(opt => ({
          text: opt.option_text,
          isCorrect: opt.is_correct
        }))
    }))

    // 다운로드 카운트 증가
    await supabase
      .from('shared_quizzes')
      .update({ download_count: (sharedQuiz.download_count || 0) + 1 })
      .eq('id', id)

    try {
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

      const rows = formattedQuestions.map((question) => {
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

    } else if (format === 'html') {
      // HTML 교사 가이드 생성
      const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${quiz.title} - 교사용 가이드</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        .question {
            margin: 30px 0;
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 4px solid #2196F3;
            border-radius: 5px;
        }
        .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .question-number {
            font-size: 18px;
            font-weight: bold;
            color: #2196F3;
        }
        .question-type {
            font-size: 12px;
            padding: 3px 10px;
            background-color: #e3f2fd;
            color: #1976d2;
            border-radius: 15px;
        }
        .question-text {
            font-size: 16px;
            margin-bottom: 15px;
            font-weight: 500;
        }
        .options {
            margin-left: 20px;
        }
        .option {
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
        }
        .correct {
            background-color: #e8f5e9;
            border: 1px solid #4CAF50;
        }
        .correct::before {
            content: "✓ ";
            color: #4CAF50;
            font-weight: bold;
        }
        .explanation {
            margin-top: 15px;
            padding: 15px;
            background-color: #fff3e0;
            border-radius: 5px;
            font-size: 14px;
        }
        .explanation-label {
            font-weight: bold;
            color: #f57c00;
            margin-bottom: 5px;
        }
        .metadata {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #e8eaf6;
            border-radius: 5px;
        }
        .metadata-item {
            margin: 5px 0;
            font-size: 14px;
        }
        @media print {
            body { background-color: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${quiz.title}</h1>
        
        <div class="metadata">
            <div class="metadata-item"><strong>주제:</strong> ${quiz.topic || '일반'}</div>
            <div class="metadata-item"><strong>총 문항 수:</strong> ${formattedQuestions.length}개</div>
            <div class="metadata-item"><strong>생성일:</strong> ${new Date().toLocaleDateString('ko-KR')}</div>
        </div>

        ${formattedQuestions.map((q, index) => `
            <div class="question">
                <div class="question-header">
                    <span class="question-number">문제 ${index + 1}</span>
                    <span class="question-type">${q.type === 'true_false' ? 'OX형' : '4지선다'}</span>
                </div>
                
                <div class="question-text">${q.question}</div>
                
                <div class="options">
                    ${q.options.map((opt, optIndex) => `
                        <div class="option ${opt.isCorrect ? 'correct' : ''}">
                            ${String.fromCharCode(65 + optIndex)}. ${opt.text}
                        </div>
                    `).join('')}
                </div>
                
                ${q.explanation ? `
                    <div class="explanation">
                        <div class="explanation-label">해설</div>
                        ${q.explanation}
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>
      `

      return new Response(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${quiz.title || 'quiz'}_teacher_guide.html"`
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

      formattedQuestions.forEach((question) => {
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

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

      return new Response(Buffer.from(excelBuffer), {
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
    } catch (formatError) {
      return NextResponse.json(
        { 
          error: `${format} 형식 생성 중 오류가 발생했습니다.`,
          details: formatError.message
        },
        { status: 500 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: '다운로드 중 오류가 발생했습니다.',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    )
  }
}