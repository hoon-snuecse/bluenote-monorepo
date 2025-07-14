// API configuration for Shed posts
// Vercel's read-only filesystem requires memory-based storage

export function getShedApiEndpoint() {
  // Check multiple conditions to detect Vercel environment
  const isVercel = 
    // Check Next.js env variable
    process.env.IS_VERCEL === 'true' ||
    // Check if running on Vercel domain
    (typeof window !== 'undefined' && (
      window.location.hostname.includes('vercel.app') || 
      window.location.hostname.includes('vercel.com') ||
      window.location.hostname.includes('bluenote-atelier')
    )) ||
    // Check for Vercel-specific environment
    (typeof process !== 'undefined' && process.env.VERCEL === '1');
  
  console.log('Environment detection:', {
    isVercel,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    env: process.env.IS_VERCEL
  });
  
  return isVercel ? '/api/shed/posts/local' : '/api/shed/posts';
}