// 기존 exports
export { createAuthOptions } from './authOptions';
export type { ExtendedSession, ExtendedJWT, AuthCallbacks } from './authOptions';
export { SessionProvider } from './SessionProvider';
export { useSession, signIn, signOut } from './hooks';
export { getServerSession } from 'next-auth';
export { useAuthSync } from './hooks/useAuthSync';
export { createAuthMiddleware } from './middleware/authMiddleware';

// 새로운 통합 인증 시스템 exports
export * from './types';
export { AuthProvider, useAuth } from './contexts/AuthContext';
export { AuthWrapper } from './components/AuthWrapper';
export { NextAuthProvider } from './providers/NextAuthProvider';
export { FetchAdapter } from './adapters/fetch';
export { NextAuthAdapter } from './adapters/nextauth';