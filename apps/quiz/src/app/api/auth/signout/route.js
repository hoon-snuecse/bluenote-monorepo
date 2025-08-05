import { createServerClient } from '@bluenote/supabase-auth/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = createServerClient()
    
    // Supabase 로그아웃
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // 로그아웃 성공
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sign out exception:', error)
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
  }
}