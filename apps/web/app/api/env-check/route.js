import { NextResponse } from 'next/server';

export async function GET() {
  // 환경 변수 체크 (값은 숨기고 존재 여부만 표시)
  const envVars = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    ADMIN_EMAILS: !!process.env.ADMIN_EMAILS,
  };

  // 일부 값은 안전하게 표시 가능
  const safeValues = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };

  return NextResponse.json({
    status: 'Environment Variables Check',
    variables: envVars,
    safeValues: safeValues,
    authConfigured: envVars.NEXTAUTH_URL && envVars.NEXTAUTH_SECRET,
    supabaseConfigured: envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY && envVars.SUPABASE_SERVICE_ROLE_KEY,
    googleAuthConfigured: envVars.GOOGLE_CLIENT_ID && envVars.GOOGLE_CLIENT_SECRET,
  });
}