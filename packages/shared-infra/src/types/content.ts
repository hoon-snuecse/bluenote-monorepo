// 공통 콘텐츠 타입 정의

// 기본 포스트 인터페이스
export interface BasePost {
  id: string | number
  title: string
  content: string
  category?: string
  tags?: string[]
  summary?: string
  readingTime?: number
  isPublished?: boolean
  createdAt: Date
  updatedAt: Date
  authorId?: string
  author?: {
    id: string
    name: string
    email: string
  }
}

// Teaching 관련 타입
export interface TeachingPost extends BasePost {
  type: 'teaching'
  isAiGenerated?: boolean
  attachments?: TeachingAttachment[]
}

export interface TeachingAttachment {
  id: string
  postId: string | number
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: Date
}

// Research 관련 타입
export interface ResearchPost extends BasePost {
  type: 'research'
  files?: ResearchFile[]
}

export interface ResearchFile {
  id: string
  postId: string | number
  fileName: string
  fileUrl: string
  fileType: string
  uploadedAt: Date
}

// Analytics 관련 타입
export interface AnalyticsPost extends BasePost {
  type: 'analytics'
  dataSource?: string
  visualization?: object
}

// Shed 관련 타입
export interface ShedPost extends BasePost {
  type: 'shed'
  mood?: string
  weather?: string
  music?: string
}

// 통합 포스트 타입
export type Post = TeachingPost | ResearchPost | AnalyticsPost | ShedPost

// Grading 관련 타입
export interface Assignment {
  id: string
  title: string
  description: string
  dueDate?: Date
  createdBy: string
  criteria?: EvaluationCriteria[]
  status: 'draft' | 'active' | 'closed'
  createdAt: Date
  updatedAt: Date
}

export interface EvaluationCriteria {
  id: string
  name: string
  description: string
  weight: number
  maxScore: number
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  content: string
  submittedAt: Date
  status: 'submitted' | 'evaluated' | 'returned'
}

export interface Evaluation {
  id: string
  submissionId: string
  evaluatorId: string
  scores: EvaluationScore[]
  feedback: string
  totalScore: number
  evaluatedAt: Date
}

export interface EvaluationScore {
  criteriaId: string
  score: number
  comment?: string
}