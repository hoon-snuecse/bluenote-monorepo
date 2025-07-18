// Dashboard specific types
export interface DashboardEvaluation {
  id: string
  assignmentId: string
  assignmentTitle?: string
  studentId: string
  studentName: string
  studentNumber?: string
  scores?: {
    clarity: number
    validity: number
    structure: number
    expression: number
  }
  domainEvaluations?: {
    clarity: { score: number; feedback: string; level: string }
    validity: { score: number; feedback: string; level: string }
    structure: { score: number; feedback: string; level: string }
    expression: { score: number; feedback: string; level: string }
  }
  averageScore?: number
  level?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  round: number
  evaluatedAt?: Date | string
  overallFeedback?: string
}

export interface DashboardStats {
  total: number
  completed: number
  pending: number
  failed: number
  averageScore: number
  scoreDistribution?: {
    [key: string]: number
  }
}

export interface SSEUpdate {
  type: 'connected' | 'evaluation_started' | 'evaluation_completed' | 'evaluation_failed' | 'progress'
  evaluationId?: string
  studentId?: string
  assignmentId?: string
  data?: any
  timestamp: string
}

export interface BatchJob {
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