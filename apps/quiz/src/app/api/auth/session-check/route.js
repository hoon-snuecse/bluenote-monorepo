import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { createAuthOptions } from '@bluenote/auth'

export async function GET() {
  try {
    const authOptions = createAuthOptions()
    const session = await getServerSession(authOptions)
    
    if (session) {
      return NextResponse.json({
        authenticated: true,
        session: {
          user: {
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
            isAdmin: session.user.isAdmin || false
          }
        }
      })
    }
    
    return NextResponse.json({ authenticated: false })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false })
  }
}