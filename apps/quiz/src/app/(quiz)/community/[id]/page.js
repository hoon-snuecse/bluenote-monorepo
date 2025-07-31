'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react' // Temporarily removed due to React Hooks error
import { createClient } from '@/lib/supabase'
import { ChevronLeft, Download, Star, Calendar, User, FileText } from 'lucide-react'
import QuestionPreview from '@/components/QuestionPreview/QuestionPreview'

export default function CommunityQuizDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  // const { data: session } = useSession() // Temporarily removed
  const [session, setSession] = useState(undefined) // undefined: 로딩중, null: 미인증
  
  // Fetch session manually with proper handling
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // 1. 먼저 퀴즈앱 세션 확인
        const quizSessionRes = await fetch('/api/auth/session')
        const quizSessionData = await quizSessionRes.json()
        
        if (quizSessionData.authenticated && quizSessionData.user) {
          // 퀴즈앱 세션이 있으면 사용
          setSession(quizSessionData)
          return
        }
        
        // 2. 퀴즈앱 세션이 없으면 메인 사이트 세션 확인
        if (quizSessionData.needsSync || quizSessionData.hasMainSession) {
          try {
            const mainSiteUrl = process.env.NODE_ENV === 'production' 
              ? 'https://www.bluenote.site' 
              : 'http://localhost:3000'
            
            const mainSessionRes = await fetch(`${mainSiteUrl}/api/auth/session-check`, {
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
              }
            })
            
            if (mainSessionRes.ok) {
              const mainSessionData = await mainSessionRes.json()
              
              if (mainSessionData.authenticated && mainSessionData.session) {
                // 메인 세션 데이터를 사용
                setSession({
                  user: mainSessionData.session.user || mainSessionData.user,
                  authenticated: true
                })
                return
              }
            }
          } catch (error) {
            console.error('메인 사이트 세션 확인 실패:', error)
          }
        }
        
        // 3. 세션이 없는 경우
        setSession(null)
        
      } catch (error) {
        console.error('세션 확인 오류:', error)
        setSession(null)
      }
    }
    
    fetchSession()
  }, [])
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState({
    csv: false,
    excel: false,
    html: false
  })

  useEffect(() => {
    // 세션 로드가 완료된 후에만 데이터 조회 (한 번만 실행)
    if (id && session !== undefined && !quiz) {
      fetchQuizDetail()
    }
  }, [id, session !== undefined]) // session 객체가 아닌 로드 완료 여부만 체크

  const fetchQuizDetail = async () => {
    try {
      const supabase = createClient()
      
      // 세션이 있으면 RLS 컨텍스트 설정
      if (session?.user?.email) {
        await supabase.rpc('set_current_user_email', { 
          email: session.user.email 
        })
      }
      
      // 공유된 퀴즈 정보 가져오기 (is_shared 필드가 있다면 join 가능)
      const { data: sharedQuiz, error: quizError } = await supabase
        .from('shared_quizzes')
        .select(`
          *,
          quizzes!inner (
            id,
            title,
            topic,
            created_at,
            questions (
              *,
              question_options (*)
            )
          )
        `)
        .eq('id', id)
        .single()

      if (quizError) {
        console.error('퀴즈 조회 오류:', quizError)
        
        // 조인 실패 시 개별 조회 fallback
        const { data: sharedQuizBasic, error: basicError } = await supabase
          .from('shared_quizzes')
          .select('*')
          .eq('id', id)
          .single()
          
        if (basicError || !sharedQuizBasic) {
          setError('퀴즈를 찾을 수 없습니다.')
          return
        }
        
        // API를 통해 문항 정보 조회 (RLS 우회)
        let questionsData = []
        try {
          const questionsResponse = await fetch(`/api/community/quiz-questions?quizId=${sharedQuizBasic.quiz_id}`)
          if (questionsResponse.ok) {
            const data = await questionsResponse.json()
            questionsData = data.questions || []
          }
        } catch (error) {
          console.error('문항 조회 오류:', error)
        }
        
        setQuiz({
          ...sharedQuizBasic,
          id: sharedQuizBasic.quiz_id,
          shared_at: sharedQuizBasic.created_at,
          downloads: sharedQuizBasic.download_count || 0,
          average_rating: sharedQuizBasic.rating_average || 0
        })
        
        setQuestions(questionsData || [])
        return
      }

      if (!sharedQuiz || !sharedQuiz.quizzes) {
        setError('퀴즈를 찾을 수 없습니다.')
        return
      }

      console.log('sharedQuiz data:', sharedQuiz)
      console.log('questions data:', sharedQuiz.quizzes.questions)
      
      setQuiz({
        ...sharedQuiz,
        ...sharedQuiz.quizzes,
        shared_at: sharedQuiz.created_at,
        downloads: sharedQuiz.download_count || 0,
        average_rating: sharedQuiz.rating_average || 0
      })
      
      setQuestions(sharedQuiz.quizzes.questions || [])

      // 조회수 증가 (views 컬럼이 있는 경우에만)
      // TODO: 데이터베이스에 views 컬럼 추가 후 주석 해제
      // await supabase
      //   .from('shared_quizzes')
      //   .update({ views: (sharedQuiz.views || 0) + 1 })
      //   .eq('id', id)

    } catch (err) {
      console.error('퀴즈 상세 조회 오류:', err)
      setError('퀴즈를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format) => {
    if (!session || !session.user) {
      alert('다운로드하려면 로그인이 필요합니다.')
      router.push('/auth/signin')
      return
    }

    setDownloading(prev => ({ ...prev, [format]: true }))
    
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({
          quizId: quiz.quiz_id || quiz.id,
          questions: questions
        }),
      })

      if (!response.ok) {
        throw new Error('다운로드 실패')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quiz_${quiz.title || 'export'}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // 다운로드 수 증가
      const supabase = createClient()
      await supabase
        .from('shared_quizzes')
        .update({ downloads: (quiz.downloads || 0) + 1 })
        .eq('id', id)

      // 다운로드 기록 저장
      await supabase
        .from('quiz_downloads')
        .insert({
          quiz_id: quiz.quiz_id || quiz.id,
          user_email: session.user.email, // email 기반으로 저장
          format: format
        })

    } catch (error) {
      console.error('다운로드 오류:', error)
      alert('다운로드 중 오류가 발생했습니다.')
    } finally {
      setDownloading(prev => ({ ...prev, [format]: false }))
    }
  }

  if (loading || session === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">{error || '퀴즈를 찾을 수 없습니다.'}</p>
        <button
          onClick={() => router.push('/community')}
          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/community')}
          className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          커뮤니티로 돌아가기
        </button>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {quiz.user_email?.split('@')[0] || '익명'}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(quiz.shared_at).toLocaleDateString()}
            </div>
            {/* 조회수 - views 컬럼 추가 후 사용 */}
            {/* <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              조회 {quiz.views || 0}
            </div> */}
            <div className="flex items-center">
              <Download className="w-4 h-4 mr-1" />
              다운로드 {quiz.downloads || 0}
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400" />
              {quiz.average_rating?.toFixed(1) || '0.0'}
            </div>
          </div>

          {quiz.description && (
            <p className="text-gray-700 mb-4">{quiz.description}</p>
          )}

          <div className="space-y-3">
            {!session && (
              <p className="text-sm text-gray-600 italic">
                다운로드하려면 로그인이 필요합니다.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => handleDownload('csv')}
                disabled={downloading.csv}
                className={`px-4 py-2 rounded-md inline-flex items-center ${
                  session 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={!session ? '로그인이 필요합니다' : ''}
              >
                <FileText className="w-4 h-4 mr-2" />
                {downloading.csv ? '다운로드 중...' : 'CSV 다운로드'}
              </button>
              <button
                onClick={() => handleDownload('xlsx')}
                disabled={downloading.excel}
                className={`px-4 py-2 rounded-md inline-flex items-center ${
                  session 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={!session ? '로그인이 필요합니다' : ''}
              >
                <FileText className="w-4 h-4 mr-2" />
                {downloading.excel ? '다운로드 중...' : 'Excel 다운로드'}
              </button>
              <button
                onClick={() => handleDownload('html')}
                disabled={downloading.html}
                className={`px-4 py-2 rounded-md inline-flex items-center ${
                  session 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={!session ? '로그인이 필요합니다' : ''}
              >
                <FileText className="w-4 h-4 mr-2" />
                {downloading.html ? '다운로드 중...' : '교사용 가이드'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 문항 미리보기 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          문항 미리보기 ({questions.length}문항)
        </h2>
        
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionPreview
              key={question.id}
              question={question}
              index={index}
              showCheckbox={false}
              showExplanation={true}
            />
          ))}
        </div>
      </div>
    </div>
  )
}