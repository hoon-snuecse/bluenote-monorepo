import NextAuth from 'next-auth'
import { createAuthOptions } from '@bluenote/auth'
import { createClient } from '@/lib/supabase'

// Supabase 기반 권한 체크 함수들
const authCallbacks = {
  checkUserPermission: async (email) => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()
      
      return !error && !!data
    } catch (error) {
      console.error('Error checking user permission:', error)
      return true // 퀴즈 앱은 모든 사용자 허용
    }
  },
  
  getUserPermissions: async (email) => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single()
      
      if (error || !data) return null
      
      // 퀴즈 앱은 특별한 권한 체계가 없음
      return {
        role: 'user',
        can_write: true,
        claude_daily_limit: 50 // 퀴즈 생성 제한
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      return null
    }
  },

  logSignIn: async (email) => {
    const supabase = createClient()
    
    try {
      // 사용자가 없으면 생성
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!existingUser) {
        await supabase
          .from('users')
          .insert({ 
            email,
            created_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Error logging sign in:', error)
    }
  }
}

const handler = NextAuth(createAuthOptions(authCallbacks))

export { handler as GET, handler as POST }