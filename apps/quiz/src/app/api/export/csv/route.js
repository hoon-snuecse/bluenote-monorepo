import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { questions, title } = await request.json()

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
    const rows = questions.map((question) => {
      const answers = ['', '', '', '']
      const correctAnswers = []

      // 선택지 채우기
      question.options.forEach((option, index) => {
        if (index < 4) {
          answers[index] = option.text
          if (option.isCorrect) {
            correctAnswers.push(index + 1)
          }
        }
      })

      // OX형 문항의 경우 3,4번 선택지는 비워둠
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
        'Content-Disposition': `attachment; filename="${title || 'quiz'}_kahoot.csv"`
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