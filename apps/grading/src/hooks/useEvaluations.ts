import { useState, useEffect } from 'react'

interface EvaluationStats {
  total: number
  completed: number
  pending: number
  completionRate: number
}

export function useEvaluations(assignmentId?: string, round: number = 1) {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [stats, setStats] = useState<EvaluationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true)
        
        // 과제별 또는 전체 평가 데이터 가져오기
        let url = '/api/evaluations'
        const params = new URLSearchParams()
        if (assignmentId) {
          params.append('assignmentId', assignmentId)
        }
        params.append('round', round.toString())
        
        if (params.toString()) {
          url += `?${params.toString()}`
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch evaluations')
        }
        
        const data = await response.json()
        setEvaluations(data.evaluations || [])
        
        // 통계 계산
        const total = data.evaluations?.length || 0
        const completed = data.evaluations?.filter((e: any) => e.status === 'completed').length || 0
        const pending = total - completed
        const completionRate = total > 0 ? (completed / total) * 100 : 0
        
        setStats({
          total,
          completed,
          pending,
          completionRate
        })
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching evaluations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvaluations()
  }, [assignmentId, round])

  return { evaluations, stats, loading, error }
}