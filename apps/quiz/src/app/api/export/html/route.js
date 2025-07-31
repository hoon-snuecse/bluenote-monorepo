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
      
      // RLS 컨텍스트 설정
      try {
        if (session.user?.email) {
          await supabase.rpc('set_current_user_email', { 
            email: session.user.email 
          })
        }
      } catch (rlsError) {
        console.log('RLS context setting skipped:', rlsError.message)
      }
      
      // 퀴즈 숡보 조회 (직접 quizzes 테이블에서 조회)
      console.log('HTML Export - Looking for quiz with id:', quizId)
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('title, is_shared, user_email')
        .eq('id', quizId)
        .single()
        
      if (quizError) {
        console.error('Quiz fetch error:', quizError)
        console.error('Quiz ID was:', quizId)
        console.error('Error details:', quizError.message, quizError.code)
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
    
    console.log('Export HTML - processing questions:', questionsData?.length)
    console.log('First question structure:', questionsData?.[0])
    
    // 첫 번째 문항으로 데이터 구조 파악
    const sampleQuestion = questionsData?.[0]
    const isQuizBuilderFormat = sampleQuestion && 'question' in sampleQuestion

    // HTML 템플릿 생성
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${quizTitle || '퀴즈'} - 교사용 가이드</title>
    <style>
        body {
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
        }
        .question-card {
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .question-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
        }
        .badges {
            display: flex;
            gap: 8px;
        }
        .badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        .badge.type-ox {
            background-color: #d1fae5;
            color: #065f46;
        }
        .badge.type-mc {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .badge.difficulty-easy {
            background-color: #e5e7eb;
            color: #374151;
        }
        .badge.difficulty-medium {
            background-color: #fef3c7;
            color: #92400e;
        }
        .badge.difficulty-hard {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .options {
            margin: 15px 0;
        }
        .option {
            padding: 10px 15px;
            margin: 5px 0;
            background-color: white;
            border-radius: 5px;
            display: flex;
            align-items: center;
        }
        .option.correct {
            background-color: #d1fae5;
            border: 1px solid #6ee7b7;
        }
        .option-marker {
            font-weight: bold;
            margin-right: 10px;
            width: 25px;
        }
        .correct-mark {
            margin-left: auto;
            color: #059669;
            font-weight: bold;
        }
        .explanation {
            margin-top: 15px;
            padding: 15px;
            background-color: #eff6ff;
            border-radius: 5px;
            border-left: 3px solid #3b82f6;
        }
        .explanation-title {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .meta-info {
            margin-top: 15px;
            display: flex;
            gap: 20px;
            color: #6b7280;
            font-size: 14px;
        }
        @media print {
            body {
                background-color: white;
            }
            .container {
                box-shadow: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${quizTitle || '퀴즈'} - 교사용 가이드</h1>
        <p style="color: #6b7280; margin-bottom: 30px;">
            총 ${questionsData.length}개 문항 | 
            생성일: ${new Date().toLocaleDateString('ko-KR')}
        </p>
        
        ${questionsData.map((question, index) => `
        <div class="question-card">
            <div class="question-header">
                <div class="question-title">문제 ${index + 1}. ${isQuizBuilderFormat ? question.question : question.question_text}</div>
                <div class="badges">
                    <span class="badge type-${(question.type || question.question_type) === 'true_false' ? 'ox' : 'mc'}">
                        ${(question.type || question.question_type) === 'true_false' ? 'OX형' : '4지선다형'}
                    </span>
                    <span class="badge difficulty-${question.metadata?.difficulty || 'medium'}">
                        ${question.metadata?.difficulty === 'hard' ? '상' : 
                          question.metadata?.difficulty === 'medium' ? '중' : '하'}
                    </span>
                </div>
            </div>
            
            <div class="options">
                ${(question.options || question.question_options) ? (question.options || question.question_options).map((option, optIndex) => {
                    const isCorrect = isQuizBuilderFormat ? option.isCorrect : option.is_correct;
                    const optionText = isQuizBuilderFormat ? option.text : option.option_text;
                    return `
                <div class="option ${isCorrect ? 'correct' : ''}">
                    <span class="option-marker">${optIndex + 1})</span>
                    <span>${optionText}</span>
                    ${isCorrect ? '<span class="correct-mark">✓ 정답</span>' : ''}
                </div>
                `}).join('') : ''}
            </div>
            
            ${question.explanation ? `
            <div class="explanation">
                <div class="explanation-title">💡 해설</div>
                ${question.explanation}
            </div>
            ` : ''}
            
            <div class="meta-info">
                <span>⏱ 제한시간: ${question.timeLimit || question.time_limit || 30}초</span>
                <span>🎯 배점: ${question.points || 1000}점</span>
            </div>
        </div>
        `).join('')}
        
        <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; text-align: center;">
            <p>이 문서는 Bluenote Quiz Maker에서 생성되었습니다.</p>
        </div>
    </div>
</body>
</html>`

    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${quizTitle || 'quiz'}_teacher_guide.html"`
      }
    })
  } catch (error) {
    console.error('Export HTML error:', error)
    return NextResponse.json(
      { error: 'HTML 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}