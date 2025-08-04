// Quiz 앱은 메인 웹 앱의 인증 세션을 사용합니다.
// 이 라우트는 메인 웹 앱으로 리다이렉트합니다.

import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const mainAuthUrl = process.env.NODE_ENV === 'production' 
    ? 'https://bluenote.site' 
    : 'http://localhost:3000'
  
  // NextAuth 경로를 메인 사이트로 리다이렉트
  const pathname = request.nextUrl.pathname.replace('/api/auth/', '/api/auth/')
  const redirectUrl = `${mainAuthUrl}${pathname}?${searchParams}`
  
  return NextResponse.redirect(redirectUrl)
}

export async function POST(request) {
  const mainAuthUrl = process.env.NODE_ENV === 'production' 
    ? 'https://bluenote.site' 
    : 'http://localhost:3000'
  
  // POST 요청도 메인 사이트로 프록시
  const pathname = request.nextUrl.pathname.replace('/api/auth/', '/api/auth/')
  const body = await request.text()
  
  const response = await fetch(`${mainAuthUrl}${pathname}`, {
    method: 'POST',
    headers: request.headers,
    body: body,
  })
  
  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  })
}