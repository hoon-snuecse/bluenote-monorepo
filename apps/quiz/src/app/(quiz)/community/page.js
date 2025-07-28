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

  const handleDownload = async (quizId, format) => {
    try {
      if (!session) {
        alert('다운로드하려면 로그인이 필요합니다.')
        return
      }

      const response = await fetch(`/api/community/download/${quizId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Download error:', error)
        alert(error.error || '다운로드 중 오류가 발생했습니다.')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // 적절한 파일명 설정
      const quiz = sharedQuizzes.find(q => q.quiz_id === quizId)
      const filename = format === 'html' 
        ? `${quiz?.title || 'quiz'}_teacher_guide.html`
        : `${quiz?.title || 'quiz'}_kahoot.${format}`
      
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
      
      // 다운로드 수 업데이트
      const updatedQuizzes = sharedQuizzes.map(q => 
        q.quiz_id === quizId 
          ? { ...q, download_count: (q.download_count || 0) + 1 }
          : q
      )
      setSharedQuizzes(updatedQuizzes)
    } catch (error) {
      console.error('Download failed:', error)
      alert('다운로드 중 오류가 발생했습니다.')
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
              <option value="downloads">다운로드순</option>
            </select>
            
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">모든 학년</option>
              <option value="초3">초3</option>
              <option value="초4">초4</option>
              <option value="초5">초5</option>
              <option value="초6">초6</option>
              <option value="중1">중1</option>
              <option value="중2">중2</option>
              <option value="중3">중3</option>
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
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* 왼쪽: 퀴즈 정보 */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}
                  </div>
                  
                  {/* 카테고리 태그 */}
                  <div className="ml-4 flex flex-wrap gap-2">
                    {quiz.subject_category && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {quiz.subject_category}
                      </span>
                    )}
                    {quiz.grade_level && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {quiz.grade_level === 'elementary' ? '초등' : 
                         quiz.grade_level === 'middle' ? '중등' : 
                         quiz.grade_level === 'high' ? '고등' : 
                         quiz.grade_level.includes('elementary') ? quiz.grade_level.replace('elementary', '초') :
                         quiz.grade_level}
                      </span>
                    )}
                  </div>
                </div>

                {/* 메타 정보 - 가로로 배치 */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span>
                    <BookOpen className="inline h-4 w-4 mr-1" />
                    {quiz.total_questions}개 문항
                  </span>
                  <span>
                    OX {quiz.true_false_count}개 / 선다 {quiz.multiple_choice_count}개
                  </span>
                  <span className="inline-flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {quiz.user_name || '익명'}
                  </span>
                  <span>
                    {new Date(quiz.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <span>
                    <Download className="inline h-4 w-4 mr-1" />
                    {quiz.download_count}회
                  </span>
                </div>
              </div>

              {/* 오른쪽: 액션 버튼 */}
              <div className="flex items-center border-l border-gray-200 p-6">
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = `/quiz/${quiz.quiz_id || quiz.id}`}
                    className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                  >
                    자세히 보기
                  </button>
                  <button
                    onClick={() => handleDownload(quiz.quiz_id || quiz.id, 'xlsx')}
                    disabled={!session}
                    className="w-full rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => handleDownload(quiz.quiz_id || quiz.id, 'csv')}
                    disabled={!session}
                    className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleDownload(quiz.quiz_id || quiz.id, 'html')}
                    disabled={!session}
                    className="w-full rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    해설
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}