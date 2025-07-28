'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Download, 
  Star, 
  Users, 
  BookOpen,
  Filter,
  TrendingUp,
  Clock,
  Search
} from 'lucide-react'

export default function CommunityPage() {
  const { data: session } = useSession()
  const [sharedQuizzes, setSharedQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterGrade, setFilterGrade] = useState('all')

  useEffect(() => {
    loadCommunityQuizzes()
  }, [sortBy, filterCategory, filterGrade])

  const loadCommunityQuizzes = async () => {
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        category: filterCategory,
        grade: filterGrade,
      })
      
      const response = await fetch(`/api/community/quizzes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSharedQuizzes(data.quizzes)
      }
    } catch (error) {
      console.error('Failed to load community quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (sharedQuizId, format) => {
    try {
      const response = await fetch(`/api/community/download/${sharedQuizId}`, {
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
        a.download = `community_quiz.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
        
        // 다운로드 수 업데이트
        const updatedQuizzes = sharedQuizzes.map(q => 
          q.id === sharedQuizId 
            ? { ...q, download_count: q.download_count + 1 }
            : q
        )
        setSharedQuizzes(updatedQuizzes)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const filteredQuizzes = sharedQuizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">커뮤니티 퀴즈를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
        <p className="mt-1 text-sm text-gray-600">
          다른 교사들이 공유한 퀴즈를 탐색하고 다운로드하세요
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className="space-y-4 rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="퀴즈 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="recent">최신순</option>
              <option value="popular">인기순</option>
              <option value="rating">평점순</option>
              <option value="downloads">다운로드순</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">모든 과목</option>
              <option value="korean">국어</option>
              <option value="math">수학</option>
              <option value="english">영어</option>
              <option value="science">과학</option>
              <option value="social">사회</option>
              <option value="history">역사</option>
              <option value="other">기타</option>
            </select>
            
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">모든 학년</option>
              <option value="elementary">초등학교</option>
              <option value="middle">중학교</option>
              <option value="high">고등학교</option>
              <option value="general">일반</option>
            </select>
          </div>
        </div>
      </div>

      {/* 퀴즈 목록 */}
      {filteredQuizzes.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">
            {searchTerm ? '검색 결과가 없습니다.' : '아직 공유된 퀴즈가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* 퀴즈 정보 */}
              <div className="flex-1 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                </div>

                {/* 메타 정보 */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      <BookOpen className="inline h-4 w-4 mr-1" />
                      {quiz.total_questions}개 문항
                    </span>
                    <span className="text-gray-600">
                      OX {quiz.true_false_count}개 / 선다 {quiz.multiple_choice_count}개
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center text-gray-600">
                      <Users className="mr-1 h-4 w-4" />
                      {quiz.user_name || '익명'}
                    </span>
                    <span className="text-gray-600">
                      {new Date(quiz.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>

                {/* 통계 */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center text-yellow-600">
                      <Star className="mr-1 h-4 w-4 fill-current" />
                      {quiz.rating_average.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({quiz.rating_count}개)
                    </span>
                  </div>
                  <span className="text-gray-600">
                    <Download className="inline h-4 w-4 mr-1" />
                    {quiz.download_count}회
                  </span>
                </div>

                {/* 카테고리 태그 */}
                {(quiz.subject_category || quiz.grade_level) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quiz.subject_category && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {quiz.subject_category}
                      </span>
                    )}
                    {quiz.grade_level && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {quiz.grade_level}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 다운로드 버튼 */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => window.location.href = `/community/${quiz.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    자세히 보기
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(quiz.id, 'xlsx')}
                      disabled={!session}
                      className="inline-flex items-center rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Excel
                    </button>
                    <button
                      onClick={() => handleDownload(quiz.id, 'csv')}
                      disabled={!session}
                      className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}