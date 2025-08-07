declare module '@bluenote/supabase-auth' {
  import { SupabaseClient } from '@supabase/supabase-js';
  import { ReactNode } from 'react';

  export function createClient(): SupabaseClient;
  export function createBrowserClient(): SupabaseClient;

  export interface SupabaseAuthProviderProps {
    children: ReactNode;
  }

  export function SupabaseAuthProvider(props: SupabaseAuthProviderProps): JSX.Element;

  export interface UseSupabaseAuthReturn {
    session: any | null;
    loading: boolean;
    error: Error | null;
  }

  export function useSupabaseAuth(): UseSupabaseAuthReturn;
}

declare module '@bluenote/supabase-auth/server' {
  import { SupabaseClient } from '@supabase/supabase-js';
  
  export function createServerClient(): Promise<SupabaseClient>;
  export function getSession(): Promise<any | null>;
  export function getUser(): Promise<any | null>;
}