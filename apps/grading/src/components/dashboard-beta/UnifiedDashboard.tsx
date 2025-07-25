'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2, FileSpreadsheet, Users, TrendingUp, AlertCircle } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  subject: string
  studentCount: number
  completedCount: number
  averageScore: number
  createdAt: string
  status: 'pending' | 'in_progress' | 'completed'
}

interface StudentResult {
  id: string
  name: string
  overallScore: number
  domains: {
    clarity: string
    evidence: string
    structure: string
    expression: string
  }
  submittedAt: string
}

export function UnifiedDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [studentResults, setStudentResults] = useState<StudentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Mock data for development
    const mockAssignments: Assignment[] = [
      {
        id: '1',
        title: '설득하는 글쓰기 - 환경보호',
        subject: '국어',
        studentCount: 30,
        completedCount: 25,
        averageScore: 85.5,
        createdAt: '2024-01-20',
        status: 'completed'
      },
      {
        id: '2',
        title: '논설문 쓰기 - 디지털 시대',
        subject: '국어',
        studentCount: 30,
        completedCount: 15,
        averageScore: 0,
        createdAt: '2024-01-25',
        status: 'in_progress'
      }
    ]

    const mockStudentResults: StudentResult[] = [
      {
        id: '1',
        name: '김민준',
        overallScore: 92,
        domains: {
          clarity: '매우 우수',
          evidence: '우수',
          structure: '매우 우수',
          expression: '우수'
        },
        submittedAt: '2024-01-20'
      },
      {
        id: '2',
        name: '박진서',
        overallScore: 88,
        domains: {
          clarity: '우수',
          evidence: '우수',
          structure: '우수',
          expression: '보통'
        },
        submittedAt: '2024-01-20'
      },
      {
        id: '3',
        name: '이서연',
        overallScore: 95,
        domains: {
          clarity: '매우 우수',
          evidence: '매우 우수',
          structure: '매우 우수',
          expression: '매우 우수'
        },
        submittedAt: '2024-01-20'
      }
    ]

    setTimeout(() => {
      setAssignments(mockAssignments)
      setLoading(false)
    }, 1000)

    // If there's a selected assignment, load its results
    if (selectedAssignment) {
      setStudentResults(mockStudentResults)
    }
  }, [selectedAssignment])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">통합 평가 대시보드</h1>
        <p className="text-muted-foreground mt-2">
          과제 관리, 평가 실행, 결과 분석을 한 곳에서 관리하세요
        </p>
      </div>

      {/* 과제 목록 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {assignments.map((assignment) => (
          <Card
            key={assignment.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedAssignment?.id === assignment.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedAssignment(assignment)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
              <CardDescription>{assignment.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">진행 상태</span>
                  <span className={`text-sm font-medium ${
                    assignment.status === 'completed' ? 'text-green-600' : 
                    assignment.status === 'in_progress' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {assignment.status === 'completed' ? '완료' : 
                     assignment.status === 'in_progress' ? '진행 중' : '대기'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">제출률</span>
                  <span className="text-sm font-medium">
                    {assignment.completedCount}/{assignment.studentCount}명
                  </span>
                </div>
                {assignment.averageScore > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">평균 점수</span>
                    <span className="text-sm font-medium">{assignment.averageScore}점</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 과제의 상세 결과 */}
      {selectedAssignment && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedAssignment.title} - 평가 결과</CardTitle>
            <CardDescription>
              학생별 평가 결과를 확인하고 내보내기할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <FileSpreadsheet className="h-4 w-4" />
                Excel 내보내기
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">학생명</th>
                    <th className="text-left p-2">전체 점수</th>
                    <th className="text-left p-2">주장의 명확성</th>
                    <th className="text-left p-2">근거의 타당성</th>
                    <th className="text-left p-2">논리적 구조</th>
                    <th className="text-left p-2">설득력 있는 표현</th>
                    <th className="text-left p-2">제출일</th>
                  </tr>
                </thead>
                <tbody>
                  {studentResults.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{student.name}</td>
                      <td className="p-2">{student.overallScore}점</td>
                      <td className="p-2">{student.domains.clarity}</td>
                      <td className="p-2">{student.domains.evidence}</td>
                      <td className="p-2">{student.domains.structure}</td>
                      <td className="p-2">{student.domains.expression}</td>
                      <td className="p-2">{student.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}