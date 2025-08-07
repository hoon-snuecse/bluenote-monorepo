import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getSession } from '@bluenote/supabase-auth/server'

export async function POST(request) {
  try {
    const session = await getSession()
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
        // RLS context setting skipped
      }
      
      // 퀴즈 정보 조회 - 본인 퀴즈이거나 공유된 퀴즈만 접근 가능
      
      let { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('title, is_shared, user_email')
        .eq('id', quizId)
        .single()
        
      if (quizError || !quiz) {
        return NextResponse.json({ error: '퀴즈를 찾을 수 없습니다.' }, { status: 404 })
      }
      
      // 본인 퀴즈가 아니고 공유되지 않은 경우 접근 제한
      if (quiz.user_email !== session.user.email && !quiz.is_shared) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
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
        return NextResponse.json({ error: '문항을 불러올 수 없습니다.' }, { status: 500 })
      }
      
      questionsData = questionsFromDb
    }
    
    
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
        
        <!-- Kahoot 업로드 가이드 -->
        <div style="margin-top: 40px; padding: 25px; background: linear-gradient(to right, #f3e8ff, #e0e7ff); border-radius: 10px; border: 1px solid #c7d2fe;">
            <h2 style="color: #6b21a8; margin-bottom: 20px;">📝 Kahoot에 퀴즈 업로드하는 방법</h2>
            
            <ol style="line-height: 2; color: #4b5563;">
                <li style="margin-bottom: 15px;">
                    <strong style="color: #7c3aed;">Kahoot 로그인</strong><br>
                    <a href="https://kahoot.com/schools/how-it-works/" target="_blank" style="color: #2563eb; text-decoration: underline;">
                        Kahoot.com 접속하기 →
                    </a>
                </li>
                
                <li style="margin-bottom: 15px;">
                    <strong style="color: #7c3aed;">새 Kahoot 만들기</strong><br>
                    상단 메뉴에서 "Create" → "Import spreadsheet" 선택
                </li>
                
                <li style="margin-bottom: 15px;">
                    <strong style="color: #7c3aed;">다운로드한 파일 업로드</strong><br>
                    위에서 다운로드한 Excel 또는 CSV 파일을 드래그 앤 드롭
                </li>
                
                <li style="margin-bottom: 15px;">
                    <strong style="color: #7c3aed;">퀴즈 설정 확인</strong><br>
                    제목, 설명, 표지 이미지 등을 설정하고 "Save" 클릭
                </li>
                
                <li style="margin-bottom: 15px;">
                    <strong style="color: #7c3aed;">퀴즈 실행</strong><br>
                    "Play" 버튼을 눌러 학생들과 함께 퀴즈 시작!
                </li>
            </ol>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>💡 팁:</strong> Kahoot 무료 계정은 최대 10명까지 동시 참여 가능합니다. 
                    더 많은 학생이 참여하려면 Pro 계정이 필요합니다.
                </p>
            </div>
            
            <div style="margin-top: 15px; font-size: 13px;">
                <a href="https://support.kahoot.com/hc/en-us/articles/115002303908-How-to-import-questions-from-a-spreadsheet" 
                   target="_blank" 
                   style="color: #7c3aed; text-decoration: underline; margin-right: 20px;">
                    상세 가이드 보기 →
                </a>
                <a href="https://kahoot.com/files/kahoot-spreadsheet-template.xlsx" 
                   target="_blank" 
                   style="color: #7c3aed; text-decoration: underline;">
                    Kahoot 템플릿 다운로드 →
                </a>
            </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; text-align: center;">
            <p>이 문서는 Bluenote Quiz Maker에서 생성되었습니다.</p>
        </div>
    </div>
</body>
</html>`

    // 파일명 안전하게 처리 (한글 인코딩)
    const safeFilename = encodeURIComponent(`${quizTitle || 'quiz'}_teacher_guide.html`)
    
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${safeFilename}`
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'HTML 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}