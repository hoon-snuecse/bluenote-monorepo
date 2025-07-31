'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
// import { useSession } from 'next-auth/react' // Temporarily removed due to React Hooks error
import { 
  Download, 
  Star, 
  Users, 
  BookOpen,
  Filter,
  TrendingUp,
  Clock,
  Search,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react'

export default function CommunityPage() {
  // const { data: session } = useSession() // Temporarily removed
  const [session, setSession] = useState(null)
  
  // Fetch session manually with sync handling
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // 1. 먼저 퀴즈앱 세션 확인
        const quizSessionRes = await fetch('/api/auth/session')
        const quizSessionData = await quizSessionRes.json()
        
        if (quizSessionData.authenticated && quizSessionData.user) {
          // 퀴즈앱 세션이 있으면 사용
          setSession(quizSessionData)
          return
        }
        
        // 2. 퀴즈앱 세션이 없으면 메인 사이트 세션 확인
        if (quizSessionData.needsSync || quizSessionData.hasMainSession) {
          try {
            const mainSiteUrl = process.env.NODE_ENV === 'production' 
              ? 'https://www.bluenote.site' 
              : 'http://localhost:3000'
            
            const mainSessionRes = await fetch(`${mainSiteUrl}/api/auth/session-check`, {
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
              }
            })
            
            if (mainSessionRes.ok) {
              const mainSessionData = await mainSessionRes.json()
              
              if (mainSessionData.authenticated && mainSessionData.session) {
                // 메인 세션 데이터를 사용
                setSession({
                  user: mainSessionData.session.user || mainSessionData.user,
                  authenticated: true
                })
                return
              }
            }
          } catch (error) {
            console.error('메인 사이트 세션 확인 실패:', error)
          }
        }
        
        // 3. 세션이 없는 경우
        setSession(null)
        
      } catch (error) {
        console.error('세션 확인 오류:', error)
        setSession(null)
      }
    }
    
    fetchSession()
  }, [])
  const [sharedQuizzes, setSharedQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterGrade, setFilterGrade] = useState('all')
  const [selectedQuizzes, setSelectedQuizzes] = useState([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  useEffect(() => {
    loadCommunityQuizzes()
  }, [sortBy, filterGrade])

  const loadCommunityQuizzes = async () => {
    try {
      const params = new URLSearchParams({
        sort: sortBy,
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

      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ 
          quizId
          // questions를 아예 보내지 않음 (undefined)
        }),
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

  const handleSelectQuiz = (quizId) => {
    setSelectedQuizzes(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    )
  }

  const handleDeleteSelected = async () => {
    if (selectedQuizzes.length === 0) return
    
    if (!confirm(`선택한 ${selectedQuizzes.length}개의 퀴즈를 삭제하시겠습니까?`)) return

    try {
      // Delete each selected quiz
      for (const quizId of selectedQuizzes) {
        const response = await fetch(`/api/quizzes/${quizId}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          const error = await response.json()
          console.error('Delete error:', error)
        }
      }
      
      // Reload quizzes
      await loadCommunityQuizzes()
      setSelectedQuizzes([])
      setIsSelectionMode(false)
      alert('선택한 퀴즈가 삭제되었습니다.')
    } catch (error) {
      console.error('Delete failed:', error)
      alert('삭제 중 오류가 발생했습니다.')
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

      {/* 선택 모드 컨트롤 및 퀴즈 생성 버튼 */}
      <div className="flex items-center justify-between mb-4">
        {session ? (
          <div className="flex items-center gap-2">
            {isSelectionMode ? (
              <>
                <button
                  onClick={() => {
                    setIsSelectionMode(false)
                    setSelectedQuizzes([])
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    // 본인 퀴즈만 필터링하여 전체 선택
                    const myQuizIds = filteredQuizzes
                      .filter(quiz => quiz.user_email === session.user.email)
                      .map(quiz => quiz.quiz_id)
                    setSelectedQuizzes(myQuizIds)
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  전체 선택
                </button>
                <button
                  onClick={() => setSelectedQuizzes([])}
                  disabled={selectedQuizzes.length === 0}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  선택 해제
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedQuizzes.length === 0}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  삭제 ({selectedQuizzes.length})
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsSelectionMode(true)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                선택
              </button>
            )}
          </div>
        ) : (
          <div />
        )}
        {session && (
          <Link
            href="/create"
            className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium inline-block"
          >
            퀴즈문항만들기
          </Link>
        )}
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
              <option value="elementary3">초3</option>
              <option value="elementary4">초4</option>
              <option value="elementary5">초5</option>
              <option value="elementary6">초6</option>
              <option value="middle1">중1</option>
              <option value="middle2">중2</option>
              <option value="middle3">중3</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* 체크박스 - 항상 표시, 본인 퀴즈만 활성화 */}
              <div className="absolute right-2 top-2 z-10">
                {session?.user?.email === quiz.user_email ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectQuiz(quiz.quiz_id)
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {selectedQuizzes.includes(quiz.quiz_id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                ) : (
                  <div className="p-1">
                    <Square className="w-5 h-5 text-gray-200 cursor-not-allowed" />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                {/* 제목 및 태그 */}
                <div className="pr-8">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                  
                  {/* 카테고리 태그 */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {quiz.subject_category && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {quiz.subject_category}
                      </span>
                    )}
                    {quiz.grade_level && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        {quiz.grade_level === 'elementary' ? '초등' : 
                         quiz.grade_level === 'middle' ? '중등' : 
                         quiz.grade_level === 'high' ? '고등' : 
                         quiz.grade_level.includes('elementary') ? quiz.grade_level.replace('elementary', '초') :
                         quiz.grade_level}
                      </span>
                    )}
                  </div>
                </div>

                {/* 메타 정보 */}
                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-0.5" />
                      {quiz.total_questions}문항
                    </span>
                    <span>
                      OX {quiz.true_false_count} / 선다 {quiz.multiple_choice_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-0.5" />
                      {quiz.user_name || '익명'}
                    </span>
                    <span>
                      {new Date(quiz.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Download className="h-3 w-3 mr-0.5" />
                    {quiz.download_count}회
                  </div>
                </div>

                {/* 액션 버튼 - 한 줄로 배치 */}
                <div className="mt-3 flex gap-1">
                  <Link
                    href={`/community/${quiz.id}`}
                    className="flex-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-200 text-center"
                  >
                    자세히
                  </Link>
                  <button
                    onClick={() => handleDownload(quiz.quiz_id, 'xlsx')}
                    disabled={!session}
                    className="flex-1 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => handleDownload(quiz.quiz_id, 'csv')}
                    disabled={!session}
                    className="flex-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleDownload(quiz.quiz_id, 'html')}
                    disabled={!session}
                    className="flex-1 rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
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