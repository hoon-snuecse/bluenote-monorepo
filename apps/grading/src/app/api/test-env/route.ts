import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const envCheck = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  // DATABASE_URL의 일부 정보 (보안을 위해 일부만 표시)
  let dbUrlInfo = 'Not set'
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      dbUrlInfo = `${url.protocol}//${url.hostname}:${url.port || 'default'}/${url.pathname.slice(1)}`
    } catch {
      dbUrlInfo = 'Invalid URL format'
    }
  }

  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV,
    databaseUrlInfo: dbUrlInfo,
    envVariables: envCheck,
    timestamp: new Date().toISOString()
  })
}