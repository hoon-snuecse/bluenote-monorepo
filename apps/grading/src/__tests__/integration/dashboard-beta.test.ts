import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createClient } from '@supabase/supabase-js'

// Supabase 테스트 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

describe('통합 대시보드 E2E 테스트', () => {
  let testAssignmentId: string
  let testStudentIds: string[] = []

  beforeAll(async () => {
    // 테스트 데이터 준비
    const { data: assignment } = await supabase
      .from('assignments')
      .insert({
        title: '테스트 과제',
        description: '통합 테스트용 과제',
        start_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    testAssignmentId = assignment.id

    // 테스트 학생 데이터
    const students = [
      { name: '테스트학생1', email: 'test1@test.com', grade: '고1' },
      { name: '테스트학생2', email: 'test2@test.com', grade: '고1' },
      { name: '테스트학생3', email: 'test3@test.com', grade: '고1' },
    ]

    const { data: insertedStudents } = await supabase
      .from('students')
      .insert(students)
      .select()

    testStudentIds = insertedStudents.map(s => s.id)
  })

  afterAll(async () => {
    // 테스트 데이터 정리
    if (testStudentIds.length > 0) {
      await supabase
        .from('evaluations')
        .delete()
        .in('student_id', testStudentIds)

      await supabase
        .from('students')
        .delete()
        .in('id', testStudentIds)
    }

    if (testAssignmentId) {
      await supabase
        .from('assignments')
        .delete()
        .eq('id', testAssignmentId)
    }
  })

  describe('과제 관리', () => {
    it('과제 목록이 정상적으로 로드되어야 함', async () => {
      const response = await fetch('/api/assignments')
      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.assignments)).toBe(true)
      expect(data.assignments.some(a => a.id === testAssignmentId)).toBe(true)
    })

    it('과제 상세 정보를 가져올 수 있어야 함', async () => {
      const response = await fetch(`/api/assignments/${testAssignmentId}`)
      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.assignment.title).toBe('테스트 과제')
    })
  })

  describe('학생 관리', () => {
    it('학생 목록이 정상적으로 로드되어야 함', async () => {
      const response = await fetch('/api/students')
      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.students)).toBe(true)
      expect(data.students.length).toBeGreaterThanOrEqual(3)
    })

    it('학생 일괄 업로드가 작동해야 함', async () => {
      const csvData = `이름,이메일,학년
테스트학생4,test4@test.com,고2
테스트학생5,test5@test.com,고2`

      const response = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData })
      })
      
      const data = await response.json()
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.imported).toBe(2)
    })
  })

  describe('평가 실행', () => {
    it('단일 평가가 정상적으로 실행되어야 함', async () => {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: testAssignmentId,
          studentId: testStudentIds[0],
          essay: '이것은 테스트 에세이입니다.',
        })
      })
      
      const data = await response.json()
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.evaluation).toHaveProperty('score')
      expect(data.evaluation).toHaveProperty('feedback')
    })

    it('배치 평가가 정상적으로 실행되어야 함', async () => {
      const response = await fetch('/api/evaluations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: testAssignmentId,
          studentIds: testStudentIds,
        })
      })
      
      const data = await response.json()
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.jobId).toBeDefined()

      // 작업 상태 확인
      const statusResponse = await fetch(`/api/evaluations/batch/status/${data.jobId}`)
      const statusData = await statusResponse.json()
      expect(statusData.status).toMatch(/pending|processing|completed/)
    })
  })

  describe('보고서 생성', () => {
    it('PDF 보고서 생성이 작동해야 함', async () => {
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: testAssignmentId,
          studentIds: [testStudentIds[0]],
        })
      })
      
      expect(response.ok).toBe(true)
      expect(response.headers.get('content-type')).toBe('application/pdf')
    })

    it('Excel 보고서 생성이 작동해야 함', async () => {
      const response = await fetch('/api/reports/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: testAssignmentId,
        })
      })
      
      expect(response.ok).toBe(true)
      expect(response.headers.get('content-type')).toContain('spreadsheet')
    })
  })

  describe('실시간 업데이트 (SSE)', () => {
    it('평가 스트림 연결이 작동해야 함', async () => {
      const eventSource = new EventSource('/api/evaluations/stream')
      
      const connectionPromise = new Promise((resolve) => {
        eventSource.onopen = () => resolve(true)
        eventSource.onerror = () => resolve(false)
      })

      const connected = await connectionPromise
      expect(connected).toBe(true)

      eventSource.close()
    })
  })

  describe('통계 및 분석', () => {
    it('통계 데이터를 가져올 수 있어야 함', async () => {
      const response = await fetch(`/api/statistics?assignmentId=${testAssignmentId}`)
      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('averageScore')
      expect(data).toHaveProperty('distribution')
      expect(data).toHaveProperty('correlation')
    })
  })
})