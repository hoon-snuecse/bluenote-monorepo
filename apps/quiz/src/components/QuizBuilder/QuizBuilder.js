'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Sparkles, ChevronRight } from 'lucide-react'

export default function QuizBuilder() {
  const { data: session } = useSession()
  const [topic, setTopic] = useState('')
  const [grade, setGrade] = useState('middle1')
  
  // 문항 유형별 개수
  const [trueFalseCount, setTrueFalseCount] = useState(3)
  const [multipleChoiceCount, setMultipleChoiceCount] = useState(7)
  
  // 난이도별 문항 수
  const [difficultyHigh, setDifficultyHigh] = useState(2)
  const [difficultyMedium, setDifficultyMedium] = useState(6)
  const [difficultyLow, setDifficultyLow] = useState(2)
  
  // AI 모델 선택
  const [aiModel, setAiModel] = useState('claude-sonnet-4-20250514')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState(null)
  
  // 전체 문항 수 계산
  const totalQuestions = trueFalseCount + multipleChoiceCount

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
          trueFalseCount,
          multipleChoiceCount,
          difficultyHigh,
          difficultyMedium,
          difficultyLow,
          aiModel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || '문항 생성 실패')
      }

      const data = await response.json()
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('잘못된 응답 형식입니다')
      }
      
      console.log('Generated questions:', data.questions.length)
      setQuestions(data.questions)
      
      // 임시로 sessionStorage에 저장
      sessionStorage.setItem('tempQuestions', JSON.stringify(data.questions))
    } catch (err) {
      console.error('문항 생성 오류:', err)
      setError(err.message || '문항 생성 중 오류가 발생했습니다')
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
            className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={isGenerating}
          >
            <option value="elementary3">초등학교 3학년</option>
            <option value="elementary4">초등학교 4학년</option>
            <option value="elementary5">초등학교 5학년</option>
            <option value="elementary6">초등학교 6학년</option>
            <option value="middle1">중학교 1학년</option>
            <option value="middle2">중학교 2학년</option>
            <option value="middle3">중학교 3학년</option>
          </select>
        </div>

        {/* 문항 유형별 문항 수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            문항 유형별 문항 수
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <label className="w-24 text-sm text-gray-600">OX형:</label>
              <input
                type="number"
                min="0"
                max="20"
                value={trueFalseCount}
                onChange={(e) => setTrueFalseCount(Number(e.target.value))}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isGenerating}
              />
              <span className="text-sm text-gray-600">문항</span>
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-24 text-sm text-gray-600">4지선다형:</label>
              <input
                type="number"
                min="0"
                max="20"
                value={multipleChoiceCount}
                onChange={(e) => setMultipleChoiceCount(Number(e.target.value))}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isGenerating}
              />
              <span className="text-sm text-gray-600">문항</span>
            </div>
            <div className="pl-28 text-sm font-medium text-gray-900">
              전체: {totalQuestions}문항
            </div>
          </div>
        </div>

        {/* 난이도별 문항 수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            난이도별 문항 수
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <label className="w-24 text-sm text-gray-600">상:</label>
              <input
                type="number"
                min="0"
                max="20"
                value={difficultyHigh}
                onChange={(e) => setDifficultyHigh(Number(e.target.value))}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isGenerating}
              />
              <span className="text-sm text-gray-600">문항</span>
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-24 text-sm text-gray-600">중:</label>
              <input
                type="number"
                min="0"
                max="20"
                value={difficultyMedium}
                onChange={(e) => setDifficultyMedium(Number(e.target.value))}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isGenerating}
              />
              <span className="text-sm text-gray-600">문항</span>
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-24 text-sm text-gray-600">하:</label>
              <input
                type="number"
                min="0"
                max="20"
                value={difficultyLow}
                onChange={(e) => setDifficultyLow(Number(e.target.value))}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isGenerating}
              />
              <span className="text-sm text-gray-600">문항</span>
            </div>
          </div>
        </div>

        {/* AI 모델 선택 */}
        <div>
          <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700">
            AI 모델 선택
          </label>
          <select
            id="aiModel"
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="mt-1 block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={isGenerating}
          >
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (기본)</option>
            <option value="claude-opus-4-20250514">Claude Opus 4</option>
          </select>
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
                // 선택된 문항만 필터링
                const selectedQuestions = questions.filter((_, index) => {
                  const checkbox = document.getElementById(`question-${index}`)
                  return checkbox && checkbox.checked
                })
                
                if (selectedQuestions.length === 0) {
                  alert('최소 1개 이상의 문항을 선택해주세요.')
                  return
                }
                
                // sessionStorage에 선택된 문항 저장
                sessionStorage.setItem('selectedQuestions', JSON.stringify(selectedQuestions))
                
                // 퀴즈 저장 탭으로 이동
                window.location.href = '/my-quizzes'
              }}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              선택 문항 저장하기
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          
          {/* 문항 미리보기 목록 */}
          <div className="mt-4 space-y-3">
            {questions.map((question, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`question-${index}`}
                    defaultChecked
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`question-${index}`} className="flex-1 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900">
                      {index + 1}. {question.question}
                    </p>
                    <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                      <span className={`rounded-full px-2 py-1 ${
                        question.type === 'true_false' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {question.type === 'true_false' ? 'OX형' : '4지선다형'}
                      </span>
                      <span>{question.metadata?.difficulty === 'hard' ? '상' : question.metadata?.difficulty === 'medium' ? '중' : '하'}</span>
                      <span>•</span>
                      <span>{question.timeLimit}초</span>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}