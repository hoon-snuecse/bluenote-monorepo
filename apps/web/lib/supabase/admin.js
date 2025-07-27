import { createClient } from '@supabase/supabase-js'

// Service role client for admin operations (bypasses RLS)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Enhanced validation with detailed error messages
  if (!supabaseUrl) {
    console.error('Admin Client Error: NEXT_PUBLIC_SUPABASE_URL is not set')
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  
  if (!serviceRoleKey) {
    console.error('Admin Client Error: SUPABASE_SERVICE_ROLE_KEY is not set')
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
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