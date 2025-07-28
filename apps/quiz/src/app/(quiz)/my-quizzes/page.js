'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  FileSpreadsheet, 
  Download, 
  Save,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react'

export default function PreviewPage() {
  const { data: session } = useSession()
  const [questions, setQuestions] = useState([])
  const [quizTitle, setQuizTitle] = useState('')
  const [quizTopic, setQuizTopic] = useState('')
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [expandAll, setExpandAll] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // sessionStorage에서 선택된 문항 가져오기
    const savedQuestions = sessionStorage.getItem('selectedQuestions')
    const savedTopic = sessionStorage.getItem('quizTopic')
    
    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions)
        setQuestions(parsed)
      } catch (error) {
        console.error('Failed to parse questions:', error)
      }
    }
    
    if (savedTopic) {
      setQuizTopic(savedTopic)
      setQuizTitle(savedTopic) // 주제를 제목으로도 사용
    }
    
    setLoading(false)
  }, [])

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const toggleAllQuestions = () => {
    const newExpandedState = {}
    questions.forEach((_, index) => {
      newExpandedState[index] = !expandAll
    })
    setExpandedQuestions(newExpandedState)
    setExpandAll(!expandAll)
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/export/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions, title: quizTitle }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${quizTitle || 'quiz'}_kahoot.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('CSV 내보내기 중 오류가 발생했습니다.')
    }
  }

  const handleExportXLSX = async () => {
    try {
      const response = await fetch('/api/export/xlsx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions, title: quizTitle }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${quizTitle || 'quiz'}_kahoot.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Excel 내보내기 중 오류가 발생했습니다.')
    }
  }

  const handleExportHTML = async () => {
    try {
      const response = await fetch('/api/export/html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions, title: quizTitle }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${quizTitle || 'quiz'}_teacher_guide.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('HTML 내보내기 중 오류가 발생했습니다.')
    }
  }

  const handleSaveToCommunity = async () => {
    if (!quizTitle.trim()) {
      alert('주제를 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/quizzes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          questions, 
          title: quizTitle,
          topic: quizTopic || quizTitle,
          grade: questions[0]?.metadata?.grade || 'general'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('퀴즈가 커뮤니티에 저장되었습니다!')
        // 커뮤니티 탭으로 이동
        window.location.href = '/community'
      } else {
        console.error('Save error:', data)
        alert(data.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('저장 중 오류가 발생했습니다. 로그인 상태를 확인해주세요.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">문항을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <p className="text-gray-500 mb-4">선택된 문항이 없습니다.</p>
        <a
          href="/create"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          퀴즈 생성하러 가기 →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">문항 미리보기</h1>
        <p className="mt-1 text-sm text-gray-600">
          선택한 {questions.length}개 문항을 확인하고 내보내거나 저장할 수 있습니다.
        </p>
      </div>

      {/* 액션 버튼들 - 상단으로 이동 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 내보내기 버튼들 */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-3">내보내기</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                CSV 다운로드
              </button>
              <button
                onClick={handleExportXLSX}
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel 다운로드
              </button>
              <button
                onClick={handleExportHTML}
                className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <FileText className="mr-2 h-4 w-4" />
                교사용 가이드 (HTML)
              </button>
            </div>
          </div>

          {/* 저장하기 버튼 */}
          <div className="flex-1 sm:flex-none">
            <p className="text-sm font-medium text-gray-700 mb-3">커뮤니티</p>
            <button
              onClick={handleSaveToCommunity}
              disabled={!quizTitle.trim()}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="mr-2 h-4 w-4" />
              커뮤니티에 저장하기
            </button>
          </div>
        </div>
      </div>

      {/* 퀴즈 주제 표시 */}
      <div className="bg-white rounded-lg shadow p-6">
        <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 mb-2">
          주제
        </label>
        <input
          type="text"
          id="quiz-title"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="예: 조선시대 역사 퀴즈"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* 문항 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            문항 목록 ({questions.length}개)
          </h2>
          <button
            onClick={toggleAllQuestions}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {expandAll ? (
              <>
                <Minimize2 className="h-4 w-4" />
                간략히 보기
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                전체 펼쳐보기
              </>
            )}
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {questions.map((question, index) => (
            <div key={index} className="p-6">
              {/* 문항 헤더 */}
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => toggleQuestion(index)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-gray-900">
                      {index + 1}. {question.question}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      question.type === 'true_false' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {question.type === 'true_false' ? 'OX형' : '4지선다형'}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      question.metadata?.difficulty === 'hard' 
                        ? 'bg-red-100 text-red-700'
                        : question.metadata?.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {question.metadata?.difficulty === 'hard' ? '상' : 
                       question.metadata?.difficulty === 'medium' ? '중' : '하'}
                    </span>
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <Clock className="mr-1 h-3 w-3" />
                      {question.timeLimit}초
                    </span>
                  </div>
                </div>
                <button className="ml-2 text-gray-400 hover:text-gray-600">
                  {expandedQuestions[index] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* 문항 상세 (확장 시) */}
              {expandedQuestions[index] && (
                <div className="mt-4 space-y-3">
                  {/* 선택지 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">선택지:</p>
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className={`flex items-center gap-2 p-2 rounded ${
                          option.isCorrect ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        {option.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={`text-sm ${
                          option.isCorrect ? 'font-medium text-green-900' : 'text-gray-700'
                        }`}>
                          {option.text}
                        </span>
                        {option.isCorrect && (
                          <span className="ml-auto text-xs text-green-600 font-medium">
                            정답
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 해설 */}
                  {question.explanation && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">해설:</p>
                      <p className="text-sm text-blue-800">{question.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}