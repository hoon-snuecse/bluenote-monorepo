'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { EvaluationHistory } from '@/components/evaluation/EvaluationHistory'
import { ArrowLeft, User, School, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Student {
  id: string
  studentId: string
  name: string
  school: string
  grade: string
  class?: string
  createdAt: string
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudent()
  }, [params.id])

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data)
      }
    } catch (error) {
      console.error('Failed to fetch student:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">학생 정보를 찾을 수 없습니다.</p>
        <Button onClick={() => router.push('/students')}>
          학생 목록으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 상단 네비게이션 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
      </div>

      {/* 학생 정보 카드 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            학생 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">이름</p>
              <p className="font-semibold">{student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">학번</p>
              <p className="font-semibold">{student.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <School className="h-3 w-3" />
                학교
              </p>
              <p className="font-semibold">{student.school}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">학년/반</p>
              <p className="font-semibold">
                {student.grade} {student.class && `(${student.class})`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                등록일
              </p>
              <p className="font-semibold">
                {format(new Date(student.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 평가 히스토리 */}
      <EvaluationHistory
        studentDbId={student.id}
        studentId={student.studentId}
        studentName={student.name}
      />
    </div>
  )
}