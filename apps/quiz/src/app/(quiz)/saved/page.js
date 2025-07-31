'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  FileSpreadsheet, 
  Download, 
  FileText,
  Clock,
  Trash2,
  Search,
  Plus,
  BookOpen,
  Sparkles,
  Share2,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui'

export default function SavedQuizzesPage() {
  const [session, setSession] = useState(null)
  const [myQuizzes, setMyQuizzes] = useState([])
  const [sampleQuizzes, setSampleQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Fetch session manually
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => setSession(null))
  }, [])

  useEffect(() => {
    if (session?.authenticated) {
      loadQuizzes()
    }
  }, [session])

  const loadQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes')
      if (response.ok) {
        const result = await response.json()
        setMyQuizzes(result.data.myQuizzes || [])
        setSampleQuizzes(result.data.sampleQuizzes || [])
      } else {
        console.error('Failed to load quizzes')
      }
    } catch (error) {
      console.error('Error loading quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (quizId) => {
    if (!confirm('이 퀴즈를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMyQuizzes(myQuizzes.filter(q => q.id !== quizId))
        alert('퀴즈가 삭제되었습니다.')
      } else {
        alert('삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleShare = async (quiz) => {
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/share`, {
        method: quiz.is_shared ? 'DELETE' : 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        // 퀴즈 목록 업데이트
        setMyQuizzes(myQuizzes.map(q => 
          q.id === quiz.id 
            ? { ...q, is_shared: result.quiz.is_shared }
            : q
        ))
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

  const handleExport = async (quiz, format) => {
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          quizId: quiz.id,
          title: quiz.title 
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        const filename = format === 'html' 
          ? `${quiz.title}_teacher_guide.html`
          : `${quiz.title}_kahoot.${format}`
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert(`${format.toUpperCase()} 내보내기 중 오류가 발생했습니다.`)
    }
  }

  const filteredMyQuizzes = myQuizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">✏️ 퀴즈 편집</h1>
        <p className="mt-1 text-sm text-gray-600">
          생성한 퀴즈를 관리하고 다운로드할 수 있습니다.
        </p>
      </div>

      {/* 샘플 퀴즈 섹션 */}
      {sampleQuizzes.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">샘플 퀴즈</h2>
            <span className="text-sm text-gray-500">
              (시작하기 좋은 예제들)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleQuizzes.map(quiz => (
              <Card key={quiz.id} className="border-2 border-yellow-200 bg-yellow-50/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                          샘플
                        </span>
                        <span>{quiz.subject}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>문항 수: {quiz.questions?.[0]?.count || quiz.question_count || 0}개</span>
                      <span>{quiz.grade_level}</span>
                    </div>
                    
                    {/* 내보내기 버튼들 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport(quiz, 'csv')}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                      >
                        <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                        CSV
                      </button>
                      <button
                        onClick={() => handleExport(quiz, 'xlsx')}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport(quiz, 'html')}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700"
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        가이드
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 내 퀴즈 섹션 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            내 퀴즈 ({filteredMyQuizzes.length})
          </h2>
          <div className="flex items-center gap-3">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="퀴즈 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* 새 퀴즈 만들기 */}
            <Link
              href="/create"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              새 퀴즈 만들기
            </Link>
          </div>
        </div>

        {filteredMyQuizzes.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '아직 생성한 퀴즈가 없습니다.'}
            </p>
            {!searchTerm && (
              <Link
                href="/create"
                className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                첫 퀴즈 만들기 →
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMyQuizzes.map(quiz => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <p className="mt-1 text-sm text-gray-600">
                        {quiz.topic || quiz.subject}
                      </p>
                      {quiz.is_shared && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-green-600">
                          <Globe className="h-3 w-3" />
                          공유됨
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(quiz)}
                        className={`${
                          quiz.is_shared 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-blue-600'
                        }`}
                        title={quiz.is_shared ? '공유 취소' : '공유하기'}
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>문항 수: {quiz.questions?.[0]?.count || quiz.question_count || 0}개</span>
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* 내보내기 버튼들 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport(quiz, 'csv')}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                      >
                        <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                        CSV
                      </button>
                      <button
                        onClick={() => handleExport(quiz, 'xlsx')}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Excel
                      </button>
                      <button
                        onClick={() => handleExport(quiz, 'html')}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700"
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        가이드
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}