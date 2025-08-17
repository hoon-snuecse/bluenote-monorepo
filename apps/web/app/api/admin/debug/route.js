import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Just return basic debug info
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('[Debug API] Called');
    console.log('[Debug API] Cookies count:', allCookies.length);
    console.log('[Debug API] Has service key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Check for auth cookies
    const authCookies = allCookies.filter(c => 
      c.name.includes('auth') || 
      c.name.includes('supabase') ||
      c.name.includes('session')
    );
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL || 'not-vercel'
      },
      cookies: {
        total: allCookies.length,
        authCookies: authCookies.length,
        authCookieNames: authCookies.map(c => c.name)
      }
    });
  } catch (error) {
    console.error('[Debug API] Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}