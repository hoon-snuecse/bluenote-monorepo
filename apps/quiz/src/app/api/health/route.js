import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  }

  const missingEnvVars = Object.entries(envCheck)
    .filter(([key, value]) => value === false || value === 'NOT SET')
    .map(([key]) => key)

  return NextResponse.json({
    status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
    environment: process.env.NODE_ENV,
    envCheck,
    missingEnvVars,
    timestamp: new Date().toISOString()
  })
}