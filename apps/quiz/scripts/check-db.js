import { createServiceClient } from '../src/lib/supabase.js'

async function checkDatabase() {
  const supabase = createServiceClient()
  
  console.log('=== 데이터베이스 확인 시작 ===\n')
  
  try {
    // 1. quizzes 테이블 확인
    const { data: quizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, user_email, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (quizError) {
      console.log('❌ quizzes 테이블 조회 오류:', quizError.message)
    } else {
      console.log(`✅ quizzes 테이블: ${quizzes?.length || 0}개 (최근 5개)`)
      quizzes?.forEach((quiz, i) => {
        console.log(`   ${i + 1}. ${quiz.title} (${quiz.user_email}) - ${new Date(quiz.created_at).toLocaleDateString('ko-KR')}`)
      })
    }
    
    console.log('\n')
    
    // 2. shared_quizzes 테이블 확인
    const { data: sharedQuizzes, error: sharedError } = await supabase
      .from('shared_quizzes')
      .select('id, quiz_id, title, user_email, created_at, download_count')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (sharedError) {
      console.log('❌ shared_quizzes 테이블 조회 오류:', sharedError.message)
    } else {
      console.log(`✅ shared_quizzes 테이블: ${sharedQuizzes?.length || 0}개 (최근 5개)`)
      sharedQuizzes?.forEach((quiz, i) => {
        console.log(`   ${i + 1}. ${quiz.title} (${quiz.user_email}) - 다운로드: ${quiz.download_count}회`)
      })
    }
    
    console.log('\n')
    
    // 3. questions 테이블 확인
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, quiz_id, question_text')
      .limit(10)
    
    if (questionsError) {
      console.log('❌ questions 테이블 조회 오류:', questionsError.message)
    } else {
      console.log(`✅ questions 테이블: 총 ${questions?.length || 0}개 문항 (최대 10개 표시)`)
    }
    
    console.log('\n')
    
    // 4. 통계 정보
    const { count: totalQuizzes } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalShared } = await supabase
      .from('shared_quizzes')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
    
    console.log('=== 전체 통계 ===')
    console.log(`총 퀴즈 수: ${totalQuizzes || 0}개`)
    console.log(`공유된 퀴즈: ${totalShared || 0}개`)
    console.log(`총 문항 수: ${totalQuestions || 0}개`)
    
  } catch (error) {
    console.error('데이터베이스 확인 중 오류:', error)
  }
}

// 스크립트 실행
checkDatabase()