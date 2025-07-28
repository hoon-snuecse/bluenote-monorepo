import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request) {
  try {
    const { questions, title } = await request.json()

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

    questions.forEach((question) => {
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

    // Kahoot 시트 생성
    const ws = XLSX.utils.aoa_to_sheet(kahootData)
    XLSX.utils.book_append_sheet(wb, ws, 'Kahoot Quiz')

    // 상세 정보 시트 추가 (선택사항)
    const detailData = [
      ['번호', '문제', '유형', '난이도', '시간제한', '정답', '해설']
    ]

    questions.forEach((question, index) => {
      const correctAnswer = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.text)
        .join(', ')

      detailData.push([
        index + 1,
        question.question,
        question.type === 'true_false' ? 'OX형' : '4지선다형',
        question.metadata?.difficulty === 'hard' ? '상' : 
         question.metadata?.difficulty === 'medium' ? '중' : '하',
        `${question.timeLimit}초`,
        correctAnswer,
        question.explanation || ''
      ])
    })

    const detailWs = XLSX.utils.aoa_to_sheet(detailData)
    XLSX.utils.book_append_sheet(wb, detailWs, '상세정보')

    // Excel 파일 생성
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

    return new Response(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${title || 'quiz'}_kahoot.xlsx"`
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