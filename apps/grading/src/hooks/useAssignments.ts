import { useState, useEffect, useCallback } from 'react'
import type { Assignment } from '@/types'
import { apiRequest } from '@/hooks/useErrorHandler'
import { useAPICache } from '@/hooks/useAPICache'

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { getCachedData, setCachedData } = useAPICache()

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 캐시 확인
      const cached = getCachedData<{ assignments: Assignment[] }>('assignments')
      if (cached) {
        setAssignments(cached.assignments || [])
        setLoading(false)
        return
      }

      const data = await apiRequest<{ success: boolean; assignments: Assignment[] }>(
        '/api/assignments'
      )
      
      // 빈 데이터 처리
      const assignmentList = data?.assignments || []
      
      // 데이터 검증
      const validAssignments = assignmentList.filter(
        (assignment): assignment is Assignment => 
          assignment && 
          typeof assignment.id === 'string' &&
          typeof assignment.title === 'string'
      )

      setAssignments(validAssignments)
      
      // 캐시 저장
      if (validAssignments.length > 0) {
        setCachedData('assignments', { assignments: validAssignments }, 300) // 5분 캐시
      }
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching assignments:', err)
      
      // 네트워크 에러 시 빈 배열 설정
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }, [getCachedData, setCachedData])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const refetch = useCallback(() => {
    fetchAssignments()
  }, [fetchAssignments])

  return { assignments, loading, error, refetch }
}