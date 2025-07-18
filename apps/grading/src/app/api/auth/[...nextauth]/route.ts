import NextAuth from 'next-auth'
import { createAuthOptions } from '@bluenote/auth'
import { createClient } from '@/lib/supabase'

// Supabase 기반 권한 체크 함수들
const authCallbacks = {
  checkUserPermission: async (email: string) => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('id')
        .eq('email', email)
        .eq('is_active', true)
        .single()
      
      return !error && !!data
    } catch (error) {
      console.error('Error checking user permission:', error)
      return false
    }
  },
  
  getUserPermissions: async (email: string) => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('role, can_write, claude_daily_limit')
        .eq('email', email)
        .eq('is_active', true)
        .single()
      
      if (error || !data) return null
      
      return {
        role: data.role || 'user',
        can_write: data.can_write || false,
        claude_daily_limit: data.claude_daily_limit || 3
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      return null
    }
  }
}

const handler = NextAuth(createAuthOptions(authCallbacks))

export { handler as GET, handler as POST }