import { useState, useEffect } from 'react'
import type { Assignment } from '@/types'

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/assignments')
        if (!response.ok) {
          throw new Error('Failed to fetch assignments')
        }
        const data = await response.json()
        setAssignments(data.assignments || [])
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching assignments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  return { assignments, loading, error }
}