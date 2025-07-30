// 통합 인증 시스템 타입 정의

export interface AuthUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  isAdmin?: boolean
  canWrite?: boolean
  claudeDailyLimit?: number
  role?: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  signIn: (provider?: string) => Promise<void>
  signOut: () => Promise<void>
}

export interface AuthAdapterOptions {
  apiEndpoint?: string
  signInUrl?: string
  signOutUrl?: string
}

export interface AuthAdapter {
  getSession(): Promise<AuthUser | null>
  signIn(provider?: string): Promise<void>
  signOut(): Promise<void>
  subscribeToChanges?(callback: (user: AuthUser | null) => void): () => void
}

export interface AuthWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export interface AuthProviderProps {
  children: React.ReactNode
  adapter?: AuthAdapter
  options?: AuthAdapterOptions
}