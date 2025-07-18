// 공통 사용자 타입 정의
export interface User {
  id: string
  email: string
  name: string | null
  image?: string | null
  role: UserRole
  permissions: UserPermissions
  metadata?: UserMetadata
}

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher', 
  STUDENT = 'student',
  USER = 'user'
}

export interface UserPermissions {
  isAdmin: boolean
  canWrite: boolean
  canGrade: boolean
  canViewAllSubmissions: boolean
  claudeDailyLimit: number
}

export interface UserMetadata {
  schoolName?: string
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

// 세션 타입
export interface ExtendedSession {
  user: User
  accessToken?: string
  expires: string
}

// API 응답 타입
export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}