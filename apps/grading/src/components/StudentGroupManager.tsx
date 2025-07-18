'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@bluenote/ui'
import { Input } from '@bluenote/ui'
import { Label } from '@bluenote/ui'
import { Textarea } from '@bluenote/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bluenote/ui'
import { Badge } from '@bluenote/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bluenote/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@bluenote/ui'
import { Checkbox } from '@bluenote/ui'
import { Users, Plus, Edit, Trash2, Upload, Download, Search } from 'lucide-react'
import { useStudentGroups, StudentGroup, Student } from '@/hooks/useStudentGroups'

export function StudentGroupManager() {
  const { groups, loading, createGroup, updateGroup, deleteGroup, fetchStudents, addStudents, deleteStudents } = useStudentGroups()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null)
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState<string>('')
  const [filterGrade, setFilterGrade] = useState<string>('')
  const [filterClass, setFilterClass] = useState<string>('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schoolName: '',
    gradeLevel: '',
    className: '',
    schoolYear: new Date().getFullYear().toString()
  })

  const [studentFormData, setStudentFormData] = useState<{
    students: Array<{ studentId: string; name: string; email?: string }>
  }>({
    students: [{ studentId: '', name: '', email: '' }]
  })

  const handleSubmit = async () => {
    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, formData)
      } else {
        await createGroup(formData)
      }
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 그룹을 삭제하시겠습니까? 그룹에 속한 모든 학생 정보도 함께 삭제됩니다.')) {
      await deleteGroup(id)
      if (selectedGroup?.id === id) {
        setSelectedGroup(null)
        setStudents([])
      }
    }
  }

  const handleEdit = (group: StudentGroup) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      schoolName: group.schoolName,
      gradeLevel: group.gradeLevel || '',
      className: group.className || '',
      schoolYear: group.schoolYear
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingGroup(null)
    setFormData({
      name: '',
      description: '',
      schoolName: '',
      gradeLevel: '',
      className: '',
      schoolYear: new Date().getFullYear().toString()
    })
  }

  const handleGroupSelect = async (group: StudentGroup) => {
    setSelectedGroup(group)
    try {
      const fetchedStudents = await fetchStudents(group.id)
      setStudents(fetchedStudents)
      setSelectedStudents([])
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleAddStudents = async () => {
    if (!selectedGroup) return
    
    const validStudents = studentFormData.students.filter(s => s.studentId && s.name)
    if (validStudents.length === 0) return

    try {
      await addStudents(selectedGroup.id, validStudents)
      // 학생 목록 새로고침
      const fetchedStudents = await fetchStudents(selectedGroup.id)
      setStudents(fetchedStudents)
      // 폼 초기화
      setStudentFormData({
        students: [{ studentId: '', name: '', email: '' }]
      })
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleDeleteStudents = async () => {
    if (!selectedGroup || selectedStudents.length === 0) return
    
    if (confirm(`선택한 ${selectedStudents.length}명의 학생을 삭제하시겠습니까?`)) {
      try {
        await deleteStudents(selectedGroup.id, selectedStudents)
        // 학생 목록 새로고침
        const fetchedStudents = await fetchStudents(selectedGroup.id)
        setStudents(fetchedStudents)
        setSelectedStudents([])
      } catch (error) {
        // Error is handled by the hook
      }
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedGroup) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const rows = text.split('\n').filter(row => row.trim())
      const headers = rows[0].split(',').map(h => h.trim())
      
      const studentIdIndex = headers.findIndex(h => h.includes('학번') || h.toLowerCase() === 'id')
      const nameIndex = headers.findIndex(h => h.includes('이름') || h.toLowerCase() === 'name')
      const emailIndex = headers.findIndex(h => h.includes('이메일') || h.toLowerCase() === 'email')

      if (studentIdIndex === -1 || nameIndex === -1) {
        alert('CSV 파일에 학번과 이름 열이 필요합니다.')
        return
      }

      const students = rows.slice(1).map(row => {
        const cols = row.split(',').map(c => c.trim())
        return {
          studentId: cols[studentIdIndex],
          name: cols[nameIndex],
          email: emailIndex !== -1 ? cols[emailIndex] : undefined
        }
      }).filter(s => s.studentId && s.name)

      if (students.length > 0) {
        try {
          await addStudents(selectedGroup.id, students)
          const fetchedStudents = await fetchStudents(selectedGroup.id)
          setStudents(fetchedStudents)
        } catch (error) {
          // Error is handled by the hook
        }
      }
    }
    reader.readAsText(file)
  }

  const handleExportCSV = () => {
    if (students.length === 0) return

    const headers = ['학번', '이름', '이메일']
    const rows = students.map(s => [s.studentId, s.name, s.email || ''])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `${selectedGroup?.name || '학생목록'}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const filteredGroups = groups.filter(group => {
    if (filterYear && group.schoolYear !== filterYear) return false
    if (filterGrade && group.gradeLevel !== filterGrade) return false
    if (filterClass && group.className !== filterClass) return false
    return true
  })

  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return student.name.toLowerCase().includes(term) || 
           student.studentId.toLowerCase().includes(term) ||
           (student.email && student.email.toLowerCase().includes(term))
  })

  if (loading && groups.length === 0) {
    return <div className="animate-pulse">학생 그룹을 불러오는 중...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 그룹 목록 */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">학생 그룹</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  새 그룹
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingGroup ? '그룹 수정' : '새 그룹 만들기'}
                  </DialogTitle>
                  <DialogDescription>
                    학년, 반별로 학생들을 그룹화하여 관리할 수 있습니다.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">그룹 이름 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="예: 2024학년도 1학년 1반"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="그룹에 대한 간단한 설명"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="schoolName">학교명 *</Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                      placeholder="예: 서울고등학교"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="schoolYear">학년도 *</Label>
                      <Input
                        id="schoolYear"
                        value={formData.schoolYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, schoolYear: e.target.value }))}
                        placeholder="2024"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="gradeLevel">학년</Label>
                      <Select
                        value={formData.gradeLevel}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gradeLevel: value }))}
                      >
                        <SelectTrigger id="gradeLevel">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1학년</SelectItem>
                          <SelectItem value="2">2학년</SelectItem>
                          <SelectItem value="3">3학년</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="className">반</Label>
                      <Input
                        id="className"
                        value={formData.className}
                        onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingGroup ? '수정' : '생성'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* 필터 */}
            <div className="space-y-2 mb-4">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="학년도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  {Array.from(new Set(groups.map(g => g.schoolYear))).map(year => (
                    <SelectItem key={year} value={year}>{year}학년도</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 그룹 목록 */}
            <div className="space-y-2">
              {filteredGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  등록된 그룹이 없습니다.
                </p>
              ) : (
                filteredGroups.map(group => (
                  <div
                    key={group.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedGroup?.id === group.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.schoolName} {group.gradeLevel && `${group.gradeLevel}학년`} {group.className && `${group.className}반`}
                        </p>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            <Users className="mr-1 h-3 w-3" />
                            {group.studentCount || 0}명
                          </Badge>
                          <Badge variant="outline">{group.schoolYear}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(group)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(group.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 학생 관리 */}
      <div className="lg:col-span-2">
        {selectedGroup ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedGroup.name}</CardTitle>
                  <CardDescription>
                    {selectedGroup.schoolName} • {students.length}명의 학생
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportCSV}
                    disabled={students.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    내보내기
                  </Button>
                  <label htmlFor="csv-upload">
                    <Button size="sm" variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        가져오기
                      </span>
                    </Button>
                  </label>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleImportCSV}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="list">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">학생 목록</TabsTrigger>
                  <TabsTrigger value="add">학생 추가</TabsTrigger>
                </TabsList>
                
                <TabsContent value="list" className="space-y-4">
                  {/* 검색 */}
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="이름, 학번, 이메일로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    {selectedStudents.length > 0 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteStudents}
                      >
                        선택 삭제 ({selectedStudents.length})
                      </Button>
                    )}
                  </div>

                  {/* 학생 테이블 */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                              onCheckedChange={(checked) => {
                                setSelectedStudents(checked ? filteredStudents.map(s => s.id) : [])
                              }}
                            />
                          </TableHead>
                          <TableHead>학번</TableHead>
                          <TableHead>이름</TableHead>
                          <TableHead>이메일</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              등록된 학생이 없습니다.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStudents.map(student => (
                            <TableRow key={student.id}>
                              <TableCell>
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
                              </TableCell>
                              <TableCell>{student.studentId}</TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.email || '-'}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="add" className="space-y-4">
                  <div className="space-y-4">
                    {studentFormData.students.map((student, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="학번"
                          value={student.studentId}
                          onChange={(e) => {
                            const newStudents = [...studentFormData.students]
                            newStudents[index].studentId = e.target.value
                            setStudentFormData({ students: newStudents })
                          }}
                        />
                        <Input
                          placeholder="이름"
                          value={student.name}
                          onChange={(e) => {
                            const newStudents = [...studentFormData.students]
                            newStudents[index].name = e.target.value
                            setStudentFormData({ students: newStudents })
                          }}
                        />
                        <Input
                          placeholder="이메일 (선택)"
                          value={student.email || ''}
                          onChange={(e) => {
                            const newStudents = [...studentFormData.students]
                            newStudents[index].email = e.target.value
                            setStudentFormData({ students: newStudents })
                          }}
                        />
                      </div>
                    ))}
                    
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setStudentFormData({
                            students: [...studentFormData.students, { studentId: '', name: '', email: '' }]
                          })
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        행 추가
                      </Button>
                      
                      <Button onClick={handleAddStudents}>
                        학생 추가
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                왼쪽에서 그룹을 선택하여 학생을 관리하세요.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}