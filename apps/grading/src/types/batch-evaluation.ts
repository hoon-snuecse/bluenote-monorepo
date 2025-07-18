export interface BatchEvaluationJob {
  id: string
  assignmentId: string
  studentIds: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: {
    total: number
    completed: number
    failed: number
  }
  startedAt?: Date
  completedAt?: Date
  errors?: Array<{
    studentId: string
    error: string
    timestamp: Date
  }>
  createdBy: string
  createdAt: Date
}

export interface EvaluationQueueItem {
  id: string
  jobId: string
  studentId: string
  assignmentId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'
  retryCount: number
  maxRetries: number
  error?: string
  result?: any
  createdAt: Date
  updatedAt: Date
}