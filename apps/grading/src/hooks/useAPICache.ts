import { useState, useEffect, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry<any>>()

export function useAPICache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number // Time to live in milliseconds
    enabled?: boolean
    refreshInterval?: number
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5분 기본값
    enabled = true,
    refreshInterval,
    onSuccess,
    onError
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return

    // 캐시 확인
    const cached = cache.get(key)
    const now = Date.now()

    if (!force && cached && now - cached.timestamp < cached.ttl) {
      setData(cached.data)
      setLoading(false)
      return cached.data
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      
      // 캐시 저장
      cache.set(key, {
        data: result,
        timestamp: now,
        ttl
      })

      setData(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl, enabled, onSuccess, onError])

  // 초기 로드
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 자동 새로고침
  useEffect(() => {
    if (!refreshInterval || !enabled) return

    const interval = setInterval(() => {
      fetchData(true)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchData, refreshInterval, enabled])

  const refetch = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  const invalidate = useCallback(() => {
    cache.delete(key)
  }, [key])

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  }
}

// 전체 캐시 초기화
export function clearAPICache() {
  cache.clear()
}

// 특정 패턴의 키 초기화
export function invalidateCachePattern(pattern: string | RegExp) {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key)
    }
  }
}