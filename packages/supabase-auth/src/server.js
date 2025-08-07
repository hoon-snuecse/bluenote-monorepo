// @bluenote/supabase-auth/server
// 서버 전용 exports

export { createServerClient } from './server-client.js'

// 서버에서 세션 가져오기
export async function getSession() {
  const { createServerClient } = await import('./server-client.js')
  const supabase = await createServerClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Unexpected error getting session:', error)
    return null
  }
}

// 서버에서 사용자 정보 가져오기
export async function getUser() {
  const { createServerClient } = await import('./server-client.js')
  const supabase = await createServerClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Unexpected error getting user:', error)
    return null
  }
}