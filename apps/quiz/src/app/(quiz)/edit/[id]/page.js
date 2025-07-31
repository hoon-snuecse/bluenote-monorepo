'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui'

export default function EditQuizPage({ params }) {
  const unwrappedParams = use(params)
  const quizId = unwrappedParams.id
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState({})

  // 세션 확인
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => setSession(null))
  }, [])

  // 퀴즈 데이터 로드
  useEffect(() => {
    if (session?.authenticated) {
      loadQuizData()
    }
  }, [session, quizId])

  const loadQuizData = async () => {
    try {
      // 퀴즈 상세 정보 가져오기
      const response = await fetch(`/api/quizzes/${quizId}/details`)
      if (!response.ok) {
        throw new Error('퀴즈를 불러올 수 없습니다.')
      }

      const data = await response.json()
      setQuiz(data.quiz)
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Error loading quiz:', error)
      alert('퀴즈를 불러오는 중 오류가 발생했습니다.')
      router.push('/saved')
    } finally {
      setLoading(false)
    }
  }

  const handleTitleChange = (e) => {
    setQuiz({ ...quiz, title: e.target.value })
  }

  const handleDescriptionChange = (e) => {
    setQuiz({ ...quiz, description: e.target.value })
  }

  const handleToggleShare = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/share`, {
        method: quiz.is_shared ? 'DELETE' : 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        setQuiz({ ...quiz, is_shared: result.quiz.is_shared })
        alert(quiz.is_shared ? '퀴즈 공유가 취소되었습니다.' : '퀴즈가 공유되었습니다.')
      } else {
        const error = await response.json()
        alert(error.error || '공유 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Share error:', error)
      alert('공유 처리 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteQuestion = (index) => {
    if (confirm('이 문항을 삭제하시겠습니까?')) {
      const newQuestions = questions.filter((_, i) => i !== index)
      setQuestions(newQuestions)
    }
  }

  const handleMoveQuestion = (index, direction) => {
    const newQuestions = [...questions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < newQuestions.length) {
      [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]]
      // 순서 인덱스 업데이트
      newQuestions.forEach((q, i) => {
        q.order_index = i
      })
      setQuestions(newQuestions)
    }
  }

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleSave = async () => {
    if (!quiz.title.trim()) {
      alert('퀴즈 제목을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      // 퀴즈 메타데이터 업데이트
      const metaResponse = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description
        })
      })

      if (!metaResponse.ok) {
        throw new Error('퀴즈 정보 업데이트 실패')
      }

      // 문항 순서 업데이트
      const orderResponse = await fetch(`/api/quizzes/${quizId}/questions/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: questions.map((q, index) => ({
            id: q.id,
            order_index: index
          }))
        })
      })

      if (!orderResponse.ok) {
        throw new Error('문항 순서 업데이트 실패')
      }

      alert('성공적으로 저장되었습니다!')
      router.push('/saved')
    } catch (error) {
      console.error('Save error:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
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

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">퀴즈를 찾을 수 없습니다.</p>
        <Link href="/saved" className="mt-4 text-blue-600 hover:text-blue-500">
          퀴즈 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/saved"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">퀴즈 편집</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleShare}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
              quiz.is_shared
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {quiz.is_shared ? (
              <>
                <Globe className="h-4 w-4" />
                공개됨
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                비공개
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>

      {/* 퀴즈 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>퀴즈 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              id="title"
              value={quiz.title}
              onChange={handleTitleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              설명 (선택사항)
            </label>
            <textarea
              id="description"
              value={quiz.description || ''}
              onChange={handleDescriptionChange}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="퀴즈에 대한 간단한 설명을 입력하세요..."
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>생성일: {new Date(quiz.created_at).toLocaleDateString('ko-KR')}</span>
            <span>총 {questions.length}문항</span>
          </div>
        </CardContent>
      </Card>

      {/* 문항 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>문항 목록</CardTitle>
            <span className="text-sm text-gray-600">
              드래그하여 순서를 변경할 수 있습니다
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 mt-1">
                    <button
                      onClick={() => handleMoveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <button
                      onClick={() => handleMoveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => toggleQuestion(index)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">
                            {index + 1}. {question.question_text}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            question.question_type === 'true_false' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {question.question_type === 'true_false' ? 'OX형' : '4지선다형'}
                          </span>
                          <span className="inline-flex items-center text-xs text-gray-500">
                            <Clock className="mr-1 h-3 w-3" />
                            {question.time_limit}초
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
                    {expandedQuestions[index] && question.options && (
                      <div className="mt-4 space-y-3">
                        {/* 선택지 */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">선택지:</p>
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex}
                              className={`flex items-center gap-2 p-2 rounded ${
                                option.is_correct ? 'bg-green-50' : 'bg-gray-50'
                              }`}
                            >
                              {option.is_correct ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                              <span className={`text-sm ${
                                option.is_correct ? 'font-medium text-green-900' : 'text-gray-700'
                              }`}>
                                {option.option_text}
                              </span>
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

                  <button
                    onClick={() => handleDeleteQuestion(index)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}