import { useState, useEffect, useCallback } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

export interface Student {
  id: string
  studentId: string
  name: string
  email?: string | null
  groupId: string
  createdAt: string
  updatedAt: string
}

export interface StudentGroup {
  id: string
  name: string
  description?: string | null
  schoolName: string
  gradeLevel?: string | null
  className?: string | null
  schoolYear: string
  createdBy: string
  createdAt: string
  updatedAt: string
  studentCount?: number
  students?: Student[]
}

export function useStudentGroups() {
  const [groups, setGroups] = useState<StudentGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showNotification } = useNotification()

  const fetchGroups = useCallback(async (filters?: {
    schoolYear?: string
    gradeLevel?: string
    className?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (filters?.schoolYear) params.append('schoolYear', filters.schoolYear)
      if (filters?.gradeLevel) params.append('gradeLevel', filters.gradeLevel)
      if (filters?.className) params.append('className', filters.className)
      
      const response = await fetch(`/api/student-groups?${params}`)
      if (!response.ok) {
        throw new Error('학생 그룹 조회에 실패했습니다.')
      }
      
      const data = await response.json()
      setGroups(data.groups)
    } catch (err) {
      const message = err instanceof Error ? err.message : '학생 그룹 조회 중 오류가 발생했습니다.'
      setError(message)
      showNotification({
        type: 'error',
        message
      })
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const createGroup = useCallback(async (groupData: {
    name: string
    description?: string
    schoolName: string
    gradeLevel?: string
    className?: string
    schoolYear: string
    students?: Array<{
      studentId: string
      name: string
      email?: string
    }>
  }) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/student-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupData)
      })
      
      if (!response.ok) {
        throw new Error('학생 그룹 생성에 실패했습니다.')
      }
      
      const data = await response.json()
      setGroups(prev => [data.group, ...prev])
      showNotification({
        type: 'success',
        message: '학생 그룹이 생성되었습니다.'
      })
      
      return data.group
    } catch (err) {
      const message = err instanceof Error ? err.message : '학생 그룹 생성 중 오류가 발생했습니다.'
      showNotification({
        type: 'error',
        message
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const updateGroup = useCallback(async (id: string, groupData: Partial<StudentGroup>) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/student-groups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...groupData })
      })
      
      if (!response.ok) {
        throw new Error('학생 그룹 수정에 실패했습니다.')
      }
      
      const data = await response.json()
      setGroups(prev => prev.map(g => g.id === id ? data.group : g))
      showNotification({
        type: 'success',
        message: '학생 그룹이 수정되었습니다.'
      })
      
      return data.group
    } catch (err) {
      const message = err instanceof Error ? err.message : '학생 그룹 수정 중 오류가 발생했습니다.'
      showNotification({
        type: 'error',
        message
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const deleteGroup = useCallback(async (id: string) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/student-groups?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('학생 그룹 삭제에 실패했습니다.')
      }
      
      setGroups(prev => prev.filter(g => g.id !== id))
      showNotification({
        type: 'success',
        message: '학생 그룹이 삭제되었습니다.'
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : '학생 그룹 삭제 중 오류가 발생했습니다.'
      showNotification({
        type: 'error',
        message
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  // 학생 관리 함수들
  const fetchStudents = useCallback(async (groupId: string) => {
    try {
      const response = await fetch(`/api/student-groups/${groupId}/students`)
      if (!response.ok) {
        throw new Error('학생 목록 조회에 실패했습니다.')
      }
      
      const data = await response.json()
      return data.students
    } catch (err) {
      const message = err instanceof Error ? err.message : '학생 목록 조회 중 오류가 발생했습니다.'
      showNotification({
        type: 'error',
        message
      })
      throw err
    }
  }, [showNotification])

  const addStudents = useCallback(async (groupId: string, students: Array<{
    studentId: string
    name: string
    email?: string
  }>) => {
    try {
      const response = await fetch(`/api/student-groups/${groupId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ students })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.duplicates) {
          throw new Error(`중복된 학번이 있습니다: ${data.duplicates.join(', ')}`)
        }
        throw new Error(data.error || '학생 추가에 실패했습니다.')
      }
      
      showNotification({
        type: 'success',
        message: data.message
      })
      
      // 그룹의 학생 수 업데이트
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, studentCount: (g.studentCount || 0) + data.count }
          : g
      ))
      
      return data.count
    } catch (err) {
      const message = err instanceof Error ? err.message : '학생 추가 중 오류가 발생했습니다.'
      showNotification({
        type: 'error',
        message
      })
      throw err
    }
  }, [showNotification])

  const deleteStudents = useCallback(async (groupId: string, studentIds: string[]) => {
    try {
      const response = await fetch(
        `/api/student-groups/${groupId}/students?studentIds=${studentIds.join(',')}`,
        { method: 'DELETE' }
      )
      
      if (!response.ok) {
        throw new Error('학생 삭제에 실패했습니다.')
      }
      
      const data = await response.json()
      showNotification({
        type: 'success',
        message: data.message
      })
      
      // 그룹의 학생 수 업데이트
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, studentCount: Math.max(0, (g.studentCount || 0) - data.count) }
          : g
      ))
      
      return data.count
    } catch (err) {
      const message = err instanceof Error ? err.message : '학생 삭제 중 오류가 발생했습니다.'
      showNotification({
        type: 'error',
        message
      })
      throw err
    }
  }, [showNotification])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchStudents,
    addStudents,
    deleteStudents
  }
}