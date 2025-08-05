'use client'

import { SupabaseAuthProvider } from '@bluenote/supabase-auth'

export function Providers({ children }) {
  // Supabase Auth Provider로 전환
  return (
    <SupabaseAuthProvider redirectTo="/create">
      {children}
    </SupabaseAuthProvider>
  )
}