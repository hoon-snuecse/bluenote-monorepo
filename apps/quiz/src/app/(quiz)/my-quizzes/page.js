'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Edit3, 
  Calendar,
  FileText,
  MoreVertical,
  Search
} from 'lucide-react'

export default function MyQuizzesPage() {
  const { data: session } = useSession()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (session) {
      loadMyQuizzes()
    }
  }, [session])

  const loadMyQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes/my-quizzes')
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes)
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (quizId) => {
    if (!confirm('정말로 이 퀴즈를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setQuizzes(quizzes.filter(q => q.id !== quizId))
      }
    } catch (error) {
      console.error('Failed to delete quiz:', error)
    }
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.topic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || quiz.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">퀴즈 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">내 퀴즈</h1>
        <p className="mt-1 text-sm text-gray-600">
          저장한 퀴즈를 관리하고 다시 다운로드할 수 있습니다
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="퀴즈 제목 또는 주제로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">모든 상태</option>
            <option value="draft">임시저장</option>
            <option value="published">게시됨</option>
            <option value="archived">보관됨</option>
          </select>
        </div>
      </div>

      {/* 퀴즈 목록 */}
      {filteredQuizzes.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? '검색 결과가 없습니다.' 
              : '아직 저장된 퀴즈가 없습니다.'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <a
              href="/create"
              className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              첫 퀴즈 만들기 →
            </a>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* 상태 뱃지 */}
              <div className="absolute right-4 top-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  quiz.status === 'published' 
                    ? 'bg-green-100 text-green-800'
                    : quiz.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {quiz.status === 'published' ? '게시됨' : 
                   quiz.status === 'draft' ? '임시저장' : '보관됨'}
                </span>
              </div>

              {/* 퀴즈 정보 */}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                  {quiz.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {quiz.topic}
                </p>
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(quiz.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>

              {/* 문항 정보 */}
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  총 {quiz.total_questions}개 문항
                </span>
                <div className="flex items-center gap-2">
                  {quiz.exports_count > 0 && (
                    <span className="text-xs text-gray-500">
                      {quiz.exports_count}회 내보냄
                    </span>
                  )}
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.location.href = `/create/preview?quiz_id=${quiz.id}`}
                    className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    <Edit3 className="mr-1 h-3 w-3" />
                    편집
                  </button>
                  <button
                    onClick={() => {
                      // 내보내기 모달 열기
                      alert('내보내기 기능 구현 예정')
                    }}
                    className="inline-flex items-center rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    내보내기
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(quiz.id)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}