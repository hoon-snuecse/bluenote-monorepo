import { getServerSession } from '@bluenote/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession()
    
    // 세션이 있으면 세션 정보 반환
    if (session) {
      return NextResponse.json(session)
    }
    
    // 세션이 없으면 null 반환
    return NextResponse.json(null)
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(null)
  }
}