import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * Kahoot 형식으로 퀴즈를 CSV로 내보내기
 * @param {Array} questions - 내보낼 문항 배열
 * @param {string} quizTitle - 퀴즈 제목
 */
export function exportToKahootCSV(questions, quizTitle) {
  // Kahoot CSV 형식에 맞게 데이터 변환
  const csvData = questions.map(question => {
    const options = question.options || []
    
    // Kahoot 형식: Question, Answer 1, Answer 2, Answer 3, Answer 4, Time limit, Correct answer(s)
    const row = {
      'Question': question.question.substring(0, 95), // Kahoot 제한: 95자
      'Answer 1': options[0]?.text?.substring(0, 60) || '', // Kahoot 제한: 60자
      'Answer 2': options[1]?.text?.substring(0, 60) || '',
      'Answer 3': options[2]?.text?.substring(0, 60) || '',
      'Answer 4': options[3]?.text?.substring(0, 60) || '',
      'Time limit': question.timeLimit || 30,
      'Correct answer(s)': getCorrectAnswerIndices(options)
    }
    
    return row
  })
  
  // CSV 생성
  const ws = XLSX.utils.json_to_sheet(csvData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Quiz')
  
  // CSV로 변환
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  
  saveAs(blob, `${quizTitle}_kahoot.csv`)
}

/**
 * Kahoot 형식으로 퀴즈를 Excel로 내보내기
 */
export function exportToKahootExcel(questions, quizTitle) {
  const excelData = questions.map(question => {
    const options = question.options || []
    
    return {
      'Question': question.question.substring(0, 95),
      'Answer 1': options[0]?.text?.substring(0, 60) || '',
      'Answer 2': options[1]?.text?.substring(0, 60) || '',
      'Answer 3': options[2]?.text?.substring(0, 60) || '',
      'Answer 4': options[3]?.text?.substring(0, 60) || '',
      'Time limit': question.timeLimit || 30,
      'Correct answer(s)': getCorrectAnswerIndices(options)
    }
  })
  
  const ws = XLSX.utils.json_to_sheet(excelData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Quiz')
  
  // Excel 파일 생성
  XLSX.writeFile(wb, `${quizTitle}_kahoot.xlsx`)
}

/**
 * 교사 가이드를 HTML로 내보내기
 */
export function exportTeacherGuideHTML(questions, quizTitle, metadata = {}) {
  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${quizTitle} - 교사 가이드</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        .metadata {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .metadata p {
            margin: 5px 0;
        }
        .question-block {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .question-number {
            background: #2563eb;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
        .question-type {
            background: #e5e7eb;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
        }
        .question-text {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .options {
            margin-bottom: 20px;
        }
        .option {
            padding: 10px 15px;
            margin: 5px 0;
            border-radius: 5px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
        }
        .option.correct {
            background: #d1fae5;
            border-color: #34d399;
            font-weight: bold;
        }
        .answer-section {
            background: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .answer-section h4 {
            margin-top: 0;
            color: #1e40af;
        }
        .explanation {
            color: #4b5563;
            line-height: 1.8;
        }
        @media print {
            body {
                padding: 20px;
            }
            .question-block {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <h1>${quizTitle} - 교사 가이드</h1>
    
    <div class="metadata">
        <p><strong>학년:</strong> ${metadata.grade || '전학년'}</p>
        <p><strong>주제:</strong> ${metadata.topic || '-'}</p>
        <p><strong>문항 수:</strong> ${questions.length}문항</p>
        <p><strong>생성일:</strong> ${new Date().toLocaleDateString('ko-KR')}</p>
    </div>
    
    ${questions.map((question, index) => `
        <div class="question-block">
            <div class="question-header">
                <span class="question-number">문제 ${index + 1}</span>
                <span class="question-type">${question.type === 'true_false' ? 'OX형' : '4지선다형'} (${question.timeLimit || 30}초)</span>
            </div>
            
            <div class="question-text">${question.question}</div>
            
            <div class="options">
                ${question.options.map((option, optionIndex) => `
                    <div class="option ${option.isCorrect ? 'correct' : ''}">
                        ${optionIndex + 1}. ${option.text} ${option.isCorrect ? '✓' : ''}
                    </div>
                `).join('')}
            </div>
            
            <div class="answer-section">
                <h4>정답 및 해설</h4>
                <p><strong>정답:</strong> ${getCorrectAnswerText(question.options)}</p>
                <p class="explanation">${question.explanation || '해설이 제공되지 않았습니다.'}</p>
            </div>
        </div>
    `).join('')}
</body>
</html>
  `
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
  saveAs(blob, `${quizTitle}_교사가이드.html`)
}

// 헬퍼 함수들
function getCorrectAnswerIndices(options) {
  const correctIndices = options
    .map((option, index) => option.isCorrect ? index + 1 : null)
    .filter(index => index !== null)
  
  return correctIndices.join(',')
}

function getCorrectAnswerText(options) {
  const correctOptions = options
    .filter(option => option.isCorrect)
    .map((option, index) => {
      const optionIndex = options.indexOf(option)
      return `${optionIndex + 1}번 - ${option.text}`
    })
  
  return correctOptions.join(', ')
}