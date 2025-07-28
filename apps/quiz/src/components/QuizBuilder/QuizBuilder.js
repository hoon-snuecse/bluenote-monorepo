'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Sparkles, ChevronRight } from 'lucide-react'

export default function QuizBuilder() {
  const { data: session } = useSession()
  const [topic, setTopic] = useState('')
  const [grade, setGrade] = useState('middle')
  const [questionCount, setQuestionCount] = useState(10)
  const [trueFalseRatio, setTrueFalseRatio] = useState(30)
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!topic.trim()) {
      setError('주제를 입력해주세요')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          grade,
          questionCount,
          trueFalseRatio,
        }),
      })

      if (!response.ok) {
        throw new Error('문항 생성 실패')
      }

      const data = await response.json()
      setQuestions(data.questions)
      
      // 임시로 sessionStorage에 저장
      sessionStorage.setItem('tempQuestions', JSON.stringify(data.questions))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 주제 입력 */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
            퀴즈 주제 *
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 조선시대 역사, 중학교 1학년 과학, Harry Potter 1권"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isGenerating}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            교과목, 단원, 책 제목 등을 구체적으로 입력해주세요
          </p>
        </div>

        {/* 학년 선택 */}
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
            대상 학년
          </label>
          <select
            id="grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={isGenerating}
          >
            <option value="elementary">초등학교</option>
            <option value="middle">중학교</option>
            <option value="high">고등학교</option>
            <option value="general">일반</option>
          </select>
        </div>

        {/* 문항 수 설정 */}
        <div>
          <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700">
            생성할 문항 수
          </label>
          <div className="mt-1 flex items-center space-x-3">
            <input
              type="range"
              id="questionCount"
              min="5"
              max="30"
              step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="flex-1"
              disabled={isGenerating}
            />
            <span className="w-12 text-center font-medium text-gray-900">
              {questionCount}개
            </span>
          </div>
        </div>

        {/* OX/4지선다 비율 */}
        <div>
          <label htmlFor="trueFalseRatio" className="block text-sm font-medium text-gray-700">
            문항 유형 비율
          </label>
          <div className="mt-1 flex items-center space-x-3">
            <span className="text-sm text-gray-600">4지선다</span>
            <input
              type="range"
              id="trueFalseRatio"
              min="0"
              max="100"
              step="10"
              value={trueFalseRatio}
              onChange={(e) => setTrueFalseRatio(Number(e.target.value))}
              className="flex-1"
              disabled={isGenerating}
            />
            <span className="text-sm text-gray-600">OX형</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            OX형 {trueFalseRatio}% / 4지선다 {100 - trueFalseRatio}%
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* 생성 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isGenerating || !session}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" />
                AI가 문항을 생성하는 중...
              </>
            ) : (
              <>
                <Sparkles className="-ml-1 mr-2 h-4 w-4" />
                퀴즈 문항 생성
              </>
            )}
          </button>
        </div>
      </form>

      {/* 생성된 문항 표시 */}
      {questions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              생성된 문항 ({questions.length}개)
            </h3>
            <button
              onClick={() => {
                // 문항 선택 페이지로 이동
                window.location.href = `/create/preview?quiz_id=temp`
              }}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              문항 선택하기
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          
          {/* 문항 미리보기 목록 */}
          <div className="mt-4 space-y-3">
            {questions.slice(0, 3).map((question, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {index + 1}. {question.question_text}
                    </p>
                    <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                      <span className={`rounded-full px-2 py-1 ${
                        question.question_type === 'true_false' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {question.question_type === 'true_false' ? 'OX형' : '4지선다'}
                      </span>
                      <span>{question.time_limit}초</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {questions.length > 3 && (
              <p className="text-center text-sm text-gray-500">
                +{questions.length - 3}개 더 보기...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}