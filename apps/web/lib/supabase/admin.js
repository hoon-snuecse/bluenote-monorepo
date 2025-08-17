import { createClient } from '@supabase/supabase-js'

// Service role client for admin operations (bypasses RLS)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Enhanced validation with detailed error messages
  if (!supabaseUrl) {
    console.error('Admin Client Error: NEXT_PUBLIC_SUPABASE_URL is not set')
    console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  
  if (!serviceRoleKey) {
    console.error('Admin Client Error: SUPABASE_SERVICE_ROLE_KEY is not set')
    console.error('NODE_ENV:', process.env.NODE_ENV)
    console.error('Available env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
    // 서비스 롤 키가 없으면 anon 키로 폴백 (임시)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!anonKey) {
      throw new Error('Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set')
    }
    console.warn('WARNING: Using anon key instead of service role key. Admin operations may fail.')
    return createClient(supabaseUrl, anonKey)
  }
  
  // Log environment info for debugging (without exposing sensitive data)
  console.log('Creating admin client:', {
    url: supabaseUrl.substring(0, 30) + '...',
    hasServiceKey: true,
    keyLength: serviceRoleKey.length,
    nodeEnv: process.env.NODE_ENV
  })

  try {
    // Create client with service role auth options
    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      }
    })
    
    console.log('Admin client created successfully with service role')
    
    return client
  } catch (error) {
    console.error('Failed to create admin client:', error)
    throw error
  }
}