'use client'

import { useCallback } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

export function useErrorHandler() {
  const { showNotification } = useNotification()

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error('Error:', error)

    let message = customMessage || '알 수 없는 오류가 발생했습니다.'
    let details: any = {}

    if (error instanceof Error) {
      message = customMessage || error.message
    } else if (typeof error === 'object' && error !== null) {
      const apiError = error as ApiError
      message = customMessage || apiError.message || message
      details = apiError.details || {}
    }

    // 특정 에러 코드에 대한 처리
    if (details.code === 'NETWORK_ERROR') {
      message = '네트워크 연결을 확인해주세요.'
    } else if (details.code === 'AUTH_ERROR') {
      message = '인증이 필요합니다. 다시 로그인해주세요.'
    } else if (details.code === 'PERMISSION_ERROR') {
      message = '이 작업을 수행할 권한이 없습니다.'
    } else if (details.code === 'VALIDATION_ERROR') {
      message = '입력한 데이터를 확인해주세요.'
    } else if (details.code === 'RATE_LIMIT') {
      message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    }

    showNotification({
      title: '오류',
      message,
      type: 'error',
    })

    return { message, details }
  }, [showNotification])

  return { handleError }
}

// API 요청 래퍼 함수
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        message: errorData.message || `요청 실패: ${response.statusText}`,
        code: errorData.code,
        status: response.status,
        details: errorData,
      }
    }

    // 빈 응답 처리
    const text = await response.text()
    if (!text) {
      return {} as T
    }

    try {
      return JSON.parse(text)
    } catch {
      return text as unknown as T
    }
  } catch (error) {
    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw {
        message: '서버에 연결할 수 없습니다.',
        code: 'NETWORK_ERROR',
        details: error,
      }
    }
    throw error
  }
}