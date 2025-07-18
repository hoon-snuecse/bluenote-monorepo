import { useAPICache } from './useAPICache'

export function useCachedEvaluations(assignmentId?: string, round?: number) {
  const cacheKey = `evaluations:${assignmentId || 'all'}:${round || 1}`
  
  const fetcher = async () => {
    const params = new URLSearchParams()
    if (assignmentId) params.append('assignmentId', assignmentId)
    if (round) params.append('round', round.toString())
    
    const response = await fetch(`/api/evaluations?${params}`)
    if (!response.ok) {
      throw new Error('평가 데이터를 가져오는데 실패했습니다.')
    }
    
    return response.json()
  }
  
  return useAPICache(cacheKey, fetcher, {
    ttl: 2 * 60 * 1000, // 2분
    refreshInterval: 30 * 1000, // 30초마다 자동 새로고침
  })
}