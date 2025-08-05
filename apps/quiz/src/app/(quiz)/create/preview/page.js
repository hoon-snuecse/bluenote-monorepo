'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSupabaseAuth } from '@bluenote/supabase-auth'
import { 
  CheckCircle2, 
  Circle, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Clock,
  ChevronLeft,
  Save,
  ChevronRight
} from 'lucide-react'
import { 
  exportToKahootCSV, 
  exportToKahootExcel, 
  exportTeacherGuideHTML 
} from '@/lib/exporters'

function QuizPreviewContent() {
  const { session } = useSupabaseAuth()
  const searchParams = useSearchParams()
  const quizId = searchParams.get('quiz_id')
  
  const [questions, setQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [quizInfo, setQuizInfo] = useState(null)

  useEffect(() => {
    if (quizId) {
      loadQuizData()
    }
  }, [quizId])

  const loadQuizData = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`)
      const data = await response.json()
      
      if (response.ok) {
        setQuizInfo(data.quiz)
        setQuestions(data.questions)
        setSelectedQuestions(new Set(data.questions.map((_, index) => index)))
      }
    } catch (error) {
      console.error('Failed to load quiz data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(questions.map((_, index) => index)))
    }
  }

  const handleToggleQuestion = (index) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedQuestions(newSelected)
  }

  const handleExport = async (format) => {
    const selectedQs = questions.filter((_, index) => selectedQuestions.has(index))
    
    if (selectedQs.length === 0) {
      alert('내보낼 문항을 선택해주세요.')
      return
    }

    try {
      let blob
      const title = quizInfo?.title || 'quiz'
      
      switch (format) {
        case 'csv':
          blob = await exportToKahootCSV(selectedQs, title)
          break
        case 'excel':
          blob = await exportToKahootExcel(selectedQs, title)
          break
        case 'html':
          blob = await exportTeacherGuideHTML(selectedQs, title)
          break
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}_${format === 'html' ? 'teacher_guide' : 'kahoot'}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('내보내기 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">퀴즈를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!quizId || !quizInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">퀴즈를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quizInfo.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {questions.length}개 문항 중 {selectedQuestions.size}개 선택됨
          </p>
        </div>
        <a
          href="/create"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          퀴즈 생성으로 돌아가기
        </a>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex gap-4 bg-white rounded-lg shadow p-6">
        <button
          onClick={() => handleExport('csv')}
          disabled={selectedQuestions.size === 0}
          className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV 다운로드
        </button>
        <button
          onClick={() => handleExport('excel')}
          disabled={selectedQuestions.size === 0}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="mr-2 h-4 w-4" />
          Excel 다운로드
        </button>
        <button
          onClick={() => handleExport('html')}
          disabled={selectedQuestions.size === 0}
          className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="mr-2 h-4 w-4" />
          교사용 가이드 (HTML)
        </button>
        
        {session && (
          <button
            className="ml-auto inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Save className="mr-2 h-4 w-4" />
            커뮤니티에 저장하기
          </button>
        )}
      </div>

      {/* 문항 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">문항 선택</h2>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedQuestions.size === questions.length ? '전체 해제' : '전체 선택'}
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {questions.map((question, index) => (
            <div key={index} className="p-6 hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleQuestion(index)}
                  className="mt-1 flex-shrink-0"
                >
                  {selectedQuestions.has(index) ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {index + 1}. {question.question}
                  </p>
                  <div className="mt-2 space-y-1">
                    {question.answers.map((answer, ansIndex) => (
                      <div
                        key={ansIndex}
                        className={`text-sm ${
                          answer.correct 
                            ? 'text-green-600 font-medium' 
                            : 'text-gray-600'
                        }`}
                      >
                        {String.fromCharCode(65 + ansIndex)}. {answer.text}
                        {answer.correct && ' ✓'}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {question.timeLimit || 30}초
                    </span>
                    <span>{question.type === 'quiz' ? '4지선다' : 'OX형'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function QuizPreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <QuizPreviewContent />
    </Suspense>
  )
}