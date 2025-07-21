'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { Badge } from '@bluenote/ui'
import { Checkbox } from '@bluenote/ui'
import { Input } from '@bluenote/ui'
import { ArrowLeft, Users, Search, UserCheck } from 'lucide-react'
import { useStudentGroups, StudentGroup, Student } from '@/hooks/useStudentGroups'
import { useNotification } from '@/contexts/NotificationContext'

export default function CollectFromGroupPage() {
  const params = useParams()
  const router = useRouter()
  const { groups, loading, fetchStudents } = useStudentGroups()
  const { showNotification } = useNotification()
  
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleGroupSelect = async (group: StudentGroup) => {
    setSelectedGroup(group)
    setSelectedStudents([])
    try {
      const fetchedStudents = await fetchStudents(group.id)
      setStudents(fetchedStudents)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return student.name.toLowerCase().includes(term) || 
           student.studentId.toLowerCase().includes(term)
  })

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      showNotification({
        type: 'error',
        message: '최소 1명 이상의 학생을 선택해주세요.'
      })
      return
    }

    setSubmitting(true)
    
    try {
      // 선택된 학생들의 제출물 생성
      const selectedStudentData = students.filter(s => selectedStudents.includes(s.id))
      
      for (const student of selectedStudentData) {
        const response = await fetch(`/api/assignments/${params.assignmentId}/submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentName: student.name,
            studentId: student.studentId,
            studentDbId: student.id,
            content: '', // 빈 내용으로 초기화, 나중에 수정 가능
            schoolName: selectedGroup?.schoolName,
            gradeLevel: selectedGroup?.gradeLevel,
            className: selectedGroup?.className
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to create submission for ${student.name}`)
        }
      }

      showNotification({
        type: 'success',
        message: `${selectedStudents.length}명의 학생 제출물이 생성되었습니다.`
      })

      router.push(`/assignments/${params.assignmentId}/submissions`)
    } catch (error) {
      console.error('Error creating submissions:', error)
      showNotification({
        type: 'error',
        message: '제출물 생성 중 오류가 발생했습니다.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="animate-pulse">학생 그룹을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/assignments')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            과제 관리로 돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">학생 그룹에서 선택</h1>
          <p className="text-lg text-slate-600">등록된 학생 그룹에서 제출할 학생들을 선택하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 그룹 목록 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">학생 그룹</CardTitle>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">등록된 학생 그룹이 없습니다.</p>
                    <Button
                      className="mt-4"
                      onClick={() => router.push('/students')}
                    >
                      학생 그룹 관리
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groups.map(group => (
                      <div
                        key={group.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedGroup?.id === group.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:bg-accent'
                        }`}
                        onClick={() => handleGroupSelect(group)}
                      >
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.schoolName} {group.gradeLevel && `${group.gradeLevel}학년`} {group.className && `${group.className}반`}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            <Users className="mr-1 h-3 w-3" />
                            {group.studentCount || 0}명
                          </Badge>
                          <Badge variant="outline">{group.schoolYear}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 학생 선택 */}
          <div className="lg:col-span-2">
            {selectedGroup ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedGroup.name}</CardTitle>
                      <CardDescription>
                        제출할 학생을 선택하세요 • {selectedStudents.length}명 선택됨
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedStudents.length === 0 || submitting}
                    >
                      {submitting ? '생성 중...' : `제출물 생성 (${selectedStudents.length}명)`}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 검색 */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="이름 또는 학번으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedStudents.length === filteredStudents.length) {
                          setSelectedStudents([])
                        } else {
                          setSelectedStudents(filteredStudents.map(s => s.id))
                        }
                      }}
                    >
                      {selectedStudents.length === filteredStudents.length ? '전체 해제' : '전체 선택'}
                    </Button>
                  </div>

                  {/* 학생 목록 */}
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        학생이 없습니다.
                      </p>
                    ) : (
                      filteredStudents.map(student => (
                        <div
                          key={student.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                            selectedStudents.includes(student.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-accent'
                          }`}
                        >
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => {
                              setSelectedStudents(prev =>
                                checked
                                  ? [...prev, student.id]
                                  : prev.filter(id => id !== student.id)
                              )
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.studentId}</p>
                          </div>
                          {selectedStudents.includes(student.id) && (
                            <UserCheck className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    왼쪽에서 학생 그룹을 선택하세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}