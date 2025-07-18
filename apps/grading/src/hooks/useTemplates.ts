import { useState, useEffect, useCallback } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

export interface EvaluationTemplate {
  id: string
  name: string
  description?: string
  writingType?: string
  gradeLevel?: string
  evaluationDomains: string[]
  evaluationLevels: string[]
  levelCount: number
  gradingCriteria: string
  isPublic: boolean
  createdBy: string
  creator?: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export function useTemplates() {
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showNotification } = useNotification()

  const fetchTemplates = useCallback(async (options?: {
    public?: boolean
    userOnly?: boolean
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (options?.public !== undefined) {
        params.append('public', String(options.public))
      }
      if (options?.userOnly !== undefined) {
        params.append('userOnly', String(options.userOnly))
      }
      
      const response = await fetch(`/api/templates?${params}`)
      if (!response.ok) {
        throw new Error('템플릿 조회에 실패했습니다.')
      }
      
      const data = await response.json()
      setTemplates(data.templates)
    } catch (err) {
      const message = err instanceof Error ? err.message : '템플릿 조회 중 오류가 발생했습니다.'
      setError(message)
      showNotification({
        type: 'error',
        message
      })
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const createTemplate = useCallback(async (templateData: Omit<EvaluationTemplate, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'creator'>) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      })
      
      if (!response.ok) {
        throw new Error('템플릿 생성에 실패했습니다.')
      }
      
      const data = await response.json()
      setTemplates(prev => [data.template, ...prev])
      showNotification({
        type: 'success',
        message: '템플릿이 생성되었습니다.'
      })
      
      return data.template
    } catch (err) {
      const message = err instanceof Error ? err.message : '템플릿 생성 중 오류가 발생했습니다.'
      showNotification({
        type: 'error',
        message
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const updateTemplate = useCallback(async (id: string, templateData: Partial<EvaluationTemplate>) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...templateData })
      })
      
      if (!response.ok) {
        throw new Error('템플릿 수정에 실패했습니다.')
      }
      
      const data = await response.json()
      setTemplates(prev => prev.map(t => t.id === id ? data.template : t))
      showNotification({
        type: 'success',
        message: '템플릿이 수정되었습니다.'
      })
      
      return data.template
    } catch (err) {
      const message = err instanceof Error ? err.message : '템플릿 수정 중 오류가 발생했습니다.'
      showNotification({
        type: 'error',
        message
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('템플릿 삭제에 실패했습니다.')
      }
      
      setTemplates(prev => prev.filter(t => t.id !== id))
      showNotification({
        type: 'success',
        message: '템플릿이 삭제되었습니다.'
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : '템플릿 삭제 중 오류가 발생했습니다.'
      showNotification({
        type: 'error',
        message
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
}