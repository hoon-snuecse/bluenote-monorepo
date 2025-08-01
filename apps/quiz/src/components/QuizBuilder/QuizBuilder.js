'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '@bluenote/auth'

export default function QuizBuilder() {
  const { user, status } = useAuth()
  const [topic, setTopic] = useState('')
  const [grade, setGrade] = useState('middle1')
  
  // 문항 유형별 개수
  const [trueFalseCount, setTrueFalseCount] = useState(3)
  const [multipleChoiceCount, setMultipleChoiceCount] = useState(7)
  
  // 난이도별 비율 (%)
  const [difficultyHighPercent, setDifficultyHighPercent] = useState(20)
  const [difficultyMediumPercent, setDifficultyMediumPercent] = useState(60)
  const [difficultyLowPercent, setDifficultyLowPercent] = useState(20)
  
  // AI 모델 선택
  const [aiModel, setAiModel] = useState('claude-sonnet-4-20250514')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  
  // 전체 문항 수 계산
  const totalQuestions = trueFalseCount + multipleChoiceCount
  
  // 실제 문항 수 계산
  const difficultyHigh = Math.round(totalQuestions * difficultyHighPercent / 100)
  const difficultyMedium = Math.round(totalQuestions * difficultyMediumPercent / 100)
  const difficultyLow = totalQuestions - difficultyHigh - difficultyMedium

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
        throw new Error(errorData.error || '문항 생성 실패')
      }

      const data = await response.json()
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('잘못된 응답 형식입니다')
      }
      
      
      // sessionStorage에 저장하고 바로 미리보기 페이지로 이동
      sessionStorage.setItem('tempQuestions', JSON.stringify(data.questions))
      sessionStorage.setItem('selectedQuestions', JSON.stringify(data.questions))
      sessionStorage.setItem('quizTopic', topic)
      
      // 미리보기 페이지로 이동
      window.location.href = '/my-quizzes'
    } catch (err) {
      setError(err.message || '문항 생성 중 오류가 발생했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  // 로딩 중일 때 표시
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">로딩 중...</span>
      </div>
    )
  }

  // 미인증 상태일 때 표시
  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">퀴즈를 생성하려면 로그인이 필요합니다.</p>
        <a 
          href="/auth/sync" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          로그인하기
        </a>
      </div>
    )
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
            책의 경우 작가 이름도 함께 써 주시면 도움이 됩니다.
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

        {/* 난이도별 문항 비율 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            난이도별 문항 비율
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <label className="w-24 text-sm text-gray-600">상:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={difficultyHighPercent}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, Number(e.target.value)))
                  const remaining = 100 - value
                  setDifficultyHighPercent(value)
                  // 남은 비율을 중/하에 비례 배분
                  if (remaining > 0) {
                    const mediumRatio = difficultyMediumPercent / (difficultyMediumPercent + difficultyLowPercent)
                    setDifficultyMediumPercent(Math.round(remaining * mediumRatio))
                    setDifficultyLowPercent(remaining - Math.round(remaining * mediumRatio))
                  } else {
                    setDifficultyMediumPercent(0)
                    setDifficultyLowPercent(0)
                  }
                }}
                className="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isGenerating}
              />
              <span className="text-sm text-gray-600">%</span>
              <span className="text-sm text-gray-500">({difficultyHigh}문항)</span>
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-24 text-sm text-gray-600">중:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={difficultyMediumPercent}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, Number(e.target.value)))
                  const total = value + difficultyHighPercent
                  if (total <= 100) {
                    setDifficultyMediumPercent(value)
                    setDifficultyLowPercent(100 - total)
                  }
                }}
                className="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isGenerating}
              />
              <span className="text-sm text-gray-600">%</span>
              <span className="text-sm text-gray-500">({difficultyMedium}문항)</span>
            </div>
            <div className="flex items-center space-x-3">
              <label className="w-24 text-sm text-gray-600">하:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={difficultyLowPercent}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, Number(e.target.value)))
                  const total = value + difficultyHighPercent
                  if (total <= 100) {
                    setDifficultyLowPercent(value)
                    setDifficultyMediumPercent(100 - total)
                  }
                }}
                className="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isGenerating}
              />
              <span className="text-sm text-gray-600">%</span>
              <span className="text-sm text-gray-500">({difficultyLow}문항)</span>
            </div>
            <div className="pl-28 text-sm text-gray-500">
              합계: {difficultyHighPercent + difficultyMediumPercent + difficultyLowPercent}%
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
            disabled={isGenerating || status !== 'authenticated'}
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

    </div>
  )
}