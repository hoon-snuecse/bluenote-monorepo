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
import { Users, Plus, Edit, Trash2, Upload, Download, Search, FileSpreadsheet, FileText, Sheet, FileDown } from 'lucide-react'
import { useStudentGroups, StudentGroup, Student } from '@/hooks/useStudentGroups'
import { useSession } from 'next-auth/react'

// 학교명 약칭 생성 함수
function getSchoolAbbreviation(schoolName: string): string {
  // 일반적인 학교 접미사 제거
  const suffixes = ['초등학교', '중학교', '고등학교', '학교']
  let abbrev = schoolName
  
  for (const suffix of suffixes) {
    if (abbrev.endsWith(suffix)) {
      abbrev = abbrev.slice(0, -suffix.length)
      break
    }
  }
  
  // 지역명 제거 (서울, 부산, 대구 등)
  const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
  for (const region of regions) {
    if (abbrev.startsWith(region)) {
      abbrev = abbrev.slice(region.length)
      break
    }
  }
  
  // 결과에 '초', '중', '고' 접미사 추가
  if (schoolName.includes('초등학교')) {
    abbrev += '초'
  } else if (schoolName.includes('중학교')) {
    abbrev += '중'
  } else if (schoolName.includes('고등학교')) {
    abbrev += '고'
  }
  
  return abbrev
}

export function StudentGroupManager() {
  const { data: session } = useSession()
  const { groups, loading, createGroup, updateGroup, deleteGroup, fetchStudents, addStudents, deleteStudents, updateStudent } = useStudentGroups()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null)
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState<string>('')
  const [filterGrade, setFilterGrade] = useState<string>('')
  const [filterClass, setFilterClass] = useState<string>('')
  const [importLoading, setImportLoading] = useState(false)
  const [importType, setImportType] = useState<'excel' | 'csv' | 'googlesheets'>('excel')
  const [googleSheetId, setGoogleSheetId] = useState('')
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [studentEditData, setStudentEditData] = useState({
    studentId: '',
    name: '',
    email: ''
  })
  const [studentEditDialogOpen, setStudentEditDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schoolName: '',
    gradeLevel: '',
    className: '',
    schoolYear: new Date().getFullYear().toString()
  })

  // 그룹 이름 자동 생성
  const generateGroupName = () => {
    const { schoolYear, schoolName, gradeLevel, className } = formData
    if (schoolYear && schoolName && gradeLevel && className) {
      const schoolAbbrev = getSchoolAbbreviation(schoolName)
      return `${schoolYear}${schoolAbbrev}${gradeLevel}-${className}`
    }
    return ''
  }

  // 폼 데이터 변경 시 그룹 이름 자동 생성
  const updateFormData = (updates: Partial<typeof formData>) => {
    const newFormData = { ...formData, ...updates }
    
    // 학교명, 학년, 반이 모두 입력되었고, 사용자가 직접 이름을 입력하지 않았다면 자동 생성
    if (newFormData.schoolName && newFormData.gradeLevel && newFormData.className && 
        (newFormData.name === '' || newFormData.name === generateGroupName())) {
      newFormData.name = `${newFormData.schoolYear}${getSchoolAbbreviation(newFormData.schoolName)}${newFormData.gradeLevel}-${newFormData.className}`
    }
    
    setFormData(newFormData)
  }

  const [studentFormData, setStudentFormData] = useState<{
    students: Array<{ studentId: string; name: string; grade?: string; class?: string; number?: number; email?: string }>
  }>({
    students: [{ studentId: '', name: '', grade: '', class: '', number: undefined, email: '' }]
  })

  const handleSubmit = async () => {
    try {
      console.log('Submitting form data:', formData)
      if (editingGroup) {
        await updateGroup(editingGroup.id, formData)
      } else {
        const result = await createGroup(formData)
        console.log('Group created:', result)
      }
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('그룹 생성/수정 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
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
    console.log('Group selected:', group)
    setSelectedGroup(group)
    try {
      const fetchedStudents = await fetchStudents(group.id)
      console.log('Fetched students:', fetchedStudents)
      setStudents(fetchedStudents)
      setSelectedStudents([])
    } catch (error) {
      console.error('Error fetching students:', error)
      alert('학생 목록을 불러오는 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
    }
  }

  const handleAddStudents = async () => {
    if (!selectedGroup) return
    
    // 학번이 없으면 자동 생성
    const processedStudents = studentFormData.students
      .filter(s => s.name)
      .map((s, index) => ({
        ...s,
        studentId: s.studentId || `${new Date().getFullYear()}${selectedGroup.gradeLevel || '0'}${selectedGroup.className || '0'}${String(s.number || index + 1).padStart(2, '0')}`
      }))
    
    if (processedStudents.length === 0) return

    try {
      await addStudents(selectedGroup.id, processedStudents)
      // 학생 목록 새로고침
      const fetchedStudents = await fetchStudents(selectedGroup.id)
      setStudents(fetchedStudents)
      // 폼 초기화
      setStudentFormData({
        students: [{ studentId: '', name: '', grade: '', class: '', number: undefined, email: '' }]
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

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedGroup) return

    setImportLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('groupId', selectedGroup.id)

      const response = await fetch('/api/students/import/excel', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '엑셀 파일 가져오기 실패')
      }

      if (data.students && data.students.length > 0) {
        await addStudents(selectedGroup.id, data.students)
        const fetchedStudents = await fetchStudents(selectedGroup.id)
        setStudents(fetchedStudents)
        setImportDialogOpen(false)
        alert(`${data.students.length}명의 학생을 성공적으로 가져왔습니다.`)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '엑셀 파일 가져오기 중 오류가 발생했습니다.')
    } finally {
      setImportLoading(false)
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedGroup) return

    setImportLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('groupId', selectedGroup.id)

      const response = await fetch('/api/students/import/csv', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'CSV 파일 가져오기 실패')
      }

      if (data.students && data.students.length > 0) {
        await addStudents(selectedGroup.id, data.students)
        const fetchedStudents = await fetchStudents(selectedGroup.id)
        setStudents(fetchedStudents)
        setImportDialogOpen(false)
        alert(`${data.students.length}명의 학생을 성공적으로 가져왔습니다.`)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'CSV 파일 가져오기 중 오류가 발생했습니다.')
    } finally {
      setImportLoading(false)
    }
  }

  const handleImportGoogleSheets = async () => {
    if (!googleSheetId || !selectedGroup) return

    setImportLoading(true)
    try {
      const response = await fetch('/api/students/import/google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: googleSheetId,
          groupId: selectedGroup.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Google Sheets 가져오기 실패')
      }

      if (data.students && data.students.length > 0) {
        await addStudents(selectedGroup.id, data.students)
        const fetchedStudents = await fetchStudents(selectedGroup.id)
        setStudents(fetchedStudents)
        setImportDialogOpen(false)
        setGoogleSheetId('')
        alert(`${data.students.length}명의 학생을 성공적으로 가져왔습니다.`)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Google Sheets 가져오기 중 오류가 발생했습니다.')
    } finally {
      setImportLoading(false)
    }
  }

  const handleDownloadTemplate = async (format: 'excel' | 'csv') => {
    try {
      const response = await fetch(`/api/students/template?format=${format}&lang=ko`)
      
      if (!response.ok) {
        throw new Error('템플릿 다운로드 실패')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `student_template_ko.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('템플릿 다운로드 중 오류가 발생했습니다.')
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setStudentEditData({
      studentId: student.studentId,
      name: student.name,
      email: student.email || ''
    })
    setStudentEditDialogOpen(true)
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent || !selectedGroup) return

    try {
      await updateStudent(selectedGroup.id, editingStudent.id, studentEditData)
      // 학생 목록 새로고침
      const fetchedStudents = await fetchStudents(selectedGroup.id)
      setStudents(fetchedStudents)
      setStudentEditDialogOpen(false)
      setEditingStudent(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : '학생 정보 수정 중 오류가 발생했습니다.')
    }
  }

  const handleExportCSV = () => {
    if (students.length === 0) return

    const headers = ['학년', '반', '번호', '이름', '이메일']
    const rows = students.map(s => [
      s.grade || '',
      s.class || '',
      s.number || '',
      s.name,
      s.email || ''
    ])
    
    // BOM 추가로 한글 인코딩 문제 해결
    const BOM = '\uFEFF'
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
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
           (student.grade && student.grade.toLowerCase().includes(term)) ||
           (student.class && student.class.toLowerCase().includes(term)) ||
           (student.number && student.number.toString().includes(term))
  })
  
  // 디버깅용 로그
  console.log('[StudentGroupManager] Render:', { 
    groupsLength: groups?.length || 0, 
    loading, 
    session: !!session,
    selectedGroup: !!selectedGroup 
  })

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">학생 그룹을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 그룹 목록 */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle className="text-lg">학생 그룹</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  새 그룹
                </Button>
              </DialogTrigger>
              <DialogContent style={{ backgroundColor: 'white', zIndex: 9999 }}>
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
                      onChange={(e) => updateFormData({ name: e.target.value })}
                      placeholder="예: 2024학년도 1학년 1반"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData({ description: e.target.value })}
                      placeholder="그룹에 대한 간단한 설명"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="schoolName">학교명 *</Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={(e) => updateFormData({ schoolName: e.target.value })}
                      placeholder="예: 서울고등학교"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="schoolYear">학년도 *</Label>
                      <Input
                        id="schoolYear"
                        value={formData.schoolYear}
                        onChange={(e) => updateFormData({ schoolYear: e.target.value })}
                        placeholder="2024"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="gradeLevel">학년</Label>
                      <Select
                        value={formData.gradeLevel}
                        onValueChange={(value) => updateFormData({ gradeLevel: value })}
                      >
                        <SelectTrigger id="gradeLevel" style={{ backgroundColor: 'white', border: '1px solid #e5e5e5' }}>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent style={{ backgroundColor: 'white', zIndex: 9999 }}>
                          <SelectItem value="1">1학년</SelectItem>
                          <SelectItem value="2">2학년</SelectItem>
                          <SelectItem value="3">3학년</SelectItem>
                          <SelectItem value="4">4학년</SelectItem>
                          <SelectItem value="5">5학년</SelectItem>
                          <SelectItem value="6">6학년</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="className">반</Label>
                      <Input
                        id="className"
                        value={formData.className}
                        onChange={(e) => updateFormData({ className: e.target.value })}
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
              {loading ? (
                <p className="text-center text-muted-foreground py-4">
                  그룹 목록을 불러오는 중...
                </p>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    등록된 그룹이 없습니다.
                  </p>
                  {groups.length === 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/create-sample-group', {
                            method: 'POST'
                          })
                          const result = await response.json()
                          if (result.success) {
                            window.location.reload()
                          } else {
                            alert('샘플 데이터 생성 실패: ' + result.error)
                          }
                        } catch (error) {
                          alert('샘플 데이터 생성 중 오류: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
                        }
                      }}
                    >
                      샘플 데이터 생성하기
                    </Button>
                  )}
                </div>
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
                            {group._count?.students || group.studentCount || 0}명
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
                    style={{ border: '1px solid #e5e5e5', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Download className="h-4 w-4" />
                    내보내기
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setImportDialogOpen(true)}
                    style={{ border: '1px solid #e5e5e5', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Upload className="h-4 w-4" />
                    가져오기
                  </Button>
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
                      placeholder="학년, 반, 이름으로 검색..."
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
                          <TableHead>학년</TableHead>
                          <TableHead>반</TableHead>
                          <TableHead>이름</TableHead>
                          <TableHead className="w-20">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
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
                              <TableCell>{student.grade || '-'}학년</TableCell>
                              <TableCell>{student.class || '-'}반</TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditStudent(student)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
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
                      <div key={index} className="grid grid-cols-5 gap-2">
                        <Input
                          placeholder="학년"
                          value={student.grade || ''}
                          onChange={(e) => {
                            const newStudents = [...studentFormData.students]
                            newStudents[index].grade = e.target.value
                            setStudentFormData({ students: newStudents })
                          }}
                        />
                        <Input
                          placeholder="반"
                          value={student.class || ''}
                          onChange={(e) => {
                            const newStudents = [...studentFormData.students]
                            newStudents[index].class = e.target.value
                            setStudentFormData({ students: newStudents })
                          }}
                        />
                        <Input
                          placeholder="번호"
                          type="number"
                          value={student.number || ''}
                          onChange={(e) => {
                            const newStudents = [...studentFormData.students]
                            newStudents[index].number = e.target.value ? parseInt(e.target.value) : undefined
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
                            students: [...studentFormData.students, { studentId: '', name: '', grade: '', class: '', number: undefined, email: '' }]
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

      {/* 가져오기 다이얼로그 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl" style={{ backgroundColor: 'white', zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle>학생 자료 가져오기</DialogTitle>
            <DialogDescription>
              Excel, CSV 파일 또는 Google Sheets에서 학생 정보를 가져올 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={importType} onValueChange={(value) => setImportType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="excel">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </TabsTrigger>
              <TabsTrigger value="csv">
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </TabsTrigger>
              <TabsTrigger value="googlesheets">
                <Sheet className="mr-2 h-4 w-4" />
                Google Sheets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="excel" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Excel 파일(.xlsx, .xls)에서 학생 정보를 가져옵니다. 
                파일의 첫 번째 행은 헤더여야 하며, 학년/반/이름 정보를 포함해야 합니다.
              </div>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => handleDownloadTemplate('excel')}>
                  <FileDown className="mr-2 h-4 w-4" />
                  템플릿 다운로드
                </Button>
                <label htmlFor="excel-upload">
                  <Button asChild disabled={importLoading}>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {importLoading ? '가져오는 중...' : 'Excel 파일 선택'}
                    </span>
                  </Button>
                </label>
                <input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleImportExcel}
                  disabled={importLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="csv" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                CSV 파일에서 학생 정보를 가져옵니다. 
                파일의 첫 번째 행은 헤더여야 하며, 학년/반/이름 정보를 포함해야 합니다.
              </div>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => handleDownloadTemplate('csv')}>
                  <FileDown className="mr-2 h-4 w-4" />
                  템플릿 다운로드
                </Button>
                <label htmlFor="csv-upload">
                  <Button asChild disabled={importLoading}>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {importLoading ? '가져오는 중...' : 'CSV 파일 선택'}
                    </span>
                  </Button>
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                  disabled={importLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="googlesheets" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Google Sheets에서 학생 정보를 가져옵니다. 
                스프레드시트의 첫 번째 행은 헤더여야 하며, 학년/반/이름 정보를 포함해야 합니다.
              </div>
              {!session?.user?.email && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
                  Google Sheets를 사용하려면 먼저 로그인해야 합니다.
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="sheet-id">스프레드시트 ID 또는 URL</Label>
                <Input
                  id="sheet-id"
                  placeholder="예: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={googleSheetId}
                  onChange={(e) => {
                    const value = e.target.value
                    // URL에서 ID 추출
                    const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
                    setGoogleSheetId(match ? match[1] : value)
                  }}
                  disabled={importLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Google Sheets URL에서 /d/ 다음에 오는 부분이 스프레드시트 ID입니다.
                </p>
              </div>
              <Button 
                onClick={handleImportGoogleSheets} 
                disabled={importLoading || !googleSheetId || !session?.user?.email}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {importLoading ? '가져오는 중...' : 'Google Sheets에서 가져오기'}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="bg-gray-50 rounded-md p-4">
            <h4 className="font-medium mb-2">템플릿 파일 형식</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>학년</strong> (권장): 학년, Grade, Year</li>
              <li>• <strong>반</strong> (권장): 반, Class, Classroom</li>
              <li>• <strong>번호</strong> (권장): 번호, Number, No</li>
              <li>• <strong>이름</strong> (필수): 이름, 성명, Name</li>
              <li>• <strong>이메일</strong> (선택): 이메일, Email</li>
              <li className="text-xs pt-2">※ 학번은 자동으로 생성됩니다 (학년+반+번호)</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* 학생 편집 다이얼로그 */}
      <Dialog open={studentEditDialogOpen} onOpenChange={setStudentEditDialogOpen}>
        <DialogContent style={{ backgroundColor: 'white', zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle>학생 정보 수정</DialogTitle>
            <DialogDescription>
              학생의 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-studentId">학번</Label>
              <Input
                id="edit-studentId"
                value={studentEditData.studentId}
                onChange={(e) => setStudentEditData(prev => ({ ...prev, studentId: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-name">이름</Label>
              <Input
                id="edit-name"
                value={studentEditData.name}
                onChange={(e) => setStudentEditData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">이메일</Label>
              <Input
                id="edit-email"
                type="email"
                value={studentEditData.email}
                onChange={(e) => setStudentEditData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="선택사항"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setStudentEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateStudent}>
              수정
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}