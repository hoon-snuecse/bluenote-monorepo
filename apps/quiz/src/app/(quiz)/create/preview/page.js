'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
// import { useSession } from 'next-auth/react' // Temporarily removed due to React Hooks error
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

export default function QuizPreviewPage() {
  // const { data: session } = useSession() // Temporarily removed
  const [session, setSession] = useState(null)
  
  // Fetch session manually
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => setSession(null))
  }, [])
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
      if (response.ok) {
        const data = await response.json()
        setQuizInfo(data.quiz)
        setQuestions(data.questions)
        // 기본적으로 모든 문항 선택
        setSelectedQuestions(new Set(data.questions.map(q => q.id)))
      }
    } catch (error) {
      console.error('Failed to load quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestion = (questionId) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId)
    } else {
      newSelected.add(questionId)
    }
    setSelectedQuestions(newSelected)
  }

  const toggleAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(questions.map(q => q.id)))
    }
  }

  const handleExport = (format) => {
    if (selectedQuestions.size === 0) {
      alert('최소 1개 이상의 문항을 선택해주세요.')
      return
    }

    // 선택된 문항만 필터링
    const selectedQuestionsList = questions.filter(q => selectedQuestions.has(q.id))
    
    // 내보내기 형식에 맞게 데이터 변환
    const exportQuestions = selectedQuestionsList.map(q => ({
      question: q.question_text,
      type: q.question_type,
      timeLimit: q.time_limit,
      options: q.options.map(opt => ({
        text: opt.option_text,
        isCorrect: opt.is_correct
      })),
      explanation: q.explanation || ''
    }))

    const exportTitle = quizInfo?.title || '새 퀴즈'

    switch (format) {
      case 'csv':
        exportToKahootCSV(exportQuestions, exportTitle)
        break
      case 'xlsx':
        exportToKahootExcel(exportQuestions, exportTitle)
        break
      case 'html':
        exportTeacherGuideHTML(exportQuestions, exportTitle, {
          grade: quizInfo?.metadata?.grade || '전학년',
          topic: quizInfo?.metadata?.topic || '-'
        })
        break
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">퀴즈 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            돌아가기
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">문항 선택 및 미리보기</h1>
            <p className="mt-1 text-sm text-gray-600">
              {quizInfo?.title} ({selectedQuestions.size}/{questions.length}개 선택됨)
            </p>
          </div>
        </div>
        
        {/* 액션 버튼들 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExport('xlsx')}
            disabled={selectedQuestions.size === 0}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel 다운로드
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={selectedQuestions.size === 0}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV 다운로드
          </button>
          <button
            onClick={() => handleExport('html')}
            disabled={selectedQuestions.size === 0}
            className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="mr-2 h-4 w-4" />
            교사 가이드
          </button>
        </div>
      </div>

      {/* 전체 선택 */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={selectedQuestions.size === questions.length}
            onChange={toggleAll}
            className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-700">전체 선택</span>
        </label>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>OX형: {questions.filter(q => q.question_type === 'true_false').length}개</span>
          <span>4지선다: {questions.filter(q => q.question_type === 'multiple_choice').length}개</span>
        </div>
      </div>

      {/* 문항 목록 */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`rounded-lg border bg-white p-6 transition-all ${
              selectedQuestions.has(question.id) 
                ? 'border-blue-500 shadow-md' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start">
              <button
                onClick={() => toggleQuestion(question.id)}
                className="mr-4 mt-1"
              >
                {selectedQuestions.has(question.id) ? (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              <div className="flex-1">
                {/* 문항 헤더 */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">
                      문항 {index + 1}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      question.question_type === 'true_false' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {question.question_type === 'true_false' ? 'OX형' : '4지선다'}
                    </span>
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <Clock className="mr-1 h-3 w-3" />
                      {question.time_limit}초
                    </span>
                  </div>
                  <span className={`text-xs ${
                    question.difficulty === 'easy' ? 'text-green-600' :
                    question.difficulty === 'hard' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {question.difficulty === 'easy' ? '쉬움' :
                     question.difficulty === 'hard' ? '어려움' : '보통'}
                  </span>
                </div>

                {/* 문항 내용 */}
                <p className="mb-4 text-gray-900">{question.question_text}</p>

                {/* 선택지 */}
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={option.id}
                      className={`rounded-md px-3 py-2 text-sm ${
                        option.is_correct
                          ? 'bg-green-50 text-green-800 font-medium'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {optIndex + 1}. {option.option_text}
                    </div>
                  ))}
                </div>

                {/* 힌트 및 해설 */}
                {(question.hint || question.explanation) && (
                  <div className="rounded-md bg-gray-50 p-3 text-sm">
                    {question.hint && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">힌트:</span>{' '}
                        <span className="text-gray-600">{question.hint}</span>
                      </div>
                    )}
                    {question.explanation && (
                      <div>
                        <span className="font-medium text-gray-700">해설:</span>{' '}
                        <span className="text-gray-600">{question.explanation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 고정 바 */}
      <div className="sticky bottom-0 mt-8 border-t bg-white p-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-sm text-gray-600">
            {selectedQuestions.size}개 문항이 선택되었습니다
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                // 저장 로직
                alert('퀴즈가 저장되었습니다!')
              }}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Save className="mr-2 h-4 w-4" />
              퀴즈 저장
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={selectedQuestions.size === 0}
              className="inline-flex items-center rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="mr-2 h-4 w-4" />
              선택한 문항 내보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}