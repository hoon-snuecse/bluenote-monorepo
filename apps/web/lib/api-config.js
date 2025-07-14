// API configuration for shed posts
// Switch between local file system and Supabase

export function getShedApiEndpoint() {
  // Check if Supabase is configured
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isSupabaseConfigured) {
    return '/api/shed/posts/supabase';
  }

  // Fallback to file system (local) or memory (Vercel)
  return '/api/shed/posts';
}

export function getUploadApiEndpoint() {
  return '/api/shed/upload';
}