'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@bluenote/supabase-auth'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Download, 
  Clock,
  BookOpen,
  FileText,
  FileSpreadsheet,
  FileCode
} from 'lucide-react'
import KahootUploadGuide from '@/components/KahootUploadGuide'

export default function QuizDetailPage() {
  const { session } = useSupabaseAuth()
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuizDetails()
  }, [params.id])

  const loadQuizDetails = async () => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setQuiz(data.quiz)
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Failed to load quiz details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format) => {
    try {
      const response = await fetch(`/api/community/download/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // 파일명 설정
        const filename = format === 'html' 
          ? `${quiz?.title || 'quiz'}_teacher_guide.html`
          : `${quiz?.title || 'quiz'}_kahoot.${format}`
        
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">퀴즈 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">퀴즈를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          돌아가기
        </button>
      </div>

      {/* 퀴즈 정보 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-600 mb-4">{quiz.description}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          <span className="flex items-center">
            <BookOpen className="w-4 h-4 mr-1" />
            {quiz.total_questions}개 문항
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            약 {Math.ceil(quiz.total_questions * 0.5)}분 소요
          </span>
        </div>

        {/* 다운로드 버튼들 */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleDownload('xlsx')}
            disabled={!session}
            className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            Excel
          </button>
          <button
            onClick={() => handleDownload('csv')}
            disabled={!session}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <FileCode className="w-4 h-4 mr-1" />
            CSV
          </button>
          <button
            onClick={() => handleDownload('html')}
            disabled={!session}
            className="flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <FileText className="w-4 h-4 mr-1" />
            해설
          </button>
        </div>

        {!session && (
          <p className="mt-3 text-sm text-gray-500">
            다운로드하려면 로그인이 필요합니다.
          </p>
        )}
      </div>

      {/* 문항 미리보기 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">문항 미리보기</h2>
        
        <div className="space-y-4">
          {questions.slice(0, 3).map((question, index) => (
            <div key={question.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">
                  문제 {index + 1}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {question.question_type === 'true_false' ? 'OX형' : '4지선다'}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{question.question_text}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {question.options?.map((option, optIndex) => (
                  <div 
                    key={optIndex}
                    className={`p-2 rounded ${
                      option.is_correct 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {String.fromCharCode(65 + optIndex)}. {option.option_text}
                  </div>
                ))}
              </div>
              {question.explanation && (
                <div className="mt-2 p-2 bg-amber-50 text-amber-800 rounded text-sm">
                  <span className="font-medium">해설:</span> {question.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {questions.length > 3 && (
          <div className="mt-4 space-y-4">
            {questions.slice(3).map((question, index) => (
              <div key={question.id} className="border-l-4 border-gray-300 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    문제 {index + 4}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {question.question_type === 'true_false' ? 'OX형' : '4지선다'}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{question.question_text}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {question.options?.map((option, optIndex) => (
                    <div 
                      key={optIndex}
                      className={`p-2 rounded ${
                        option.is_correct 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option.option_text}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-2 p-2 bg-amber-50 text-amber-800 rounded text-sm">
                    <span className="font-medium">해설:</span> {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kahoot 업로드 가이드 */}
      <KahootUploadGuide />
    </div>
  )
}