import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase'
import { User, UserRole, UserPermissions } from '@bluenote/shared-infra'

// GET: web 앱과 사용자 정보 동기화
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()
    
    // 먼저 user_permissions 테이블에서 권한 확인
    const { data: permissions, error: permError } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (permError || !permissions) {
      return NextResponse.json({
        success: false,
        error: 'User permissions not found'
      }, { status: 404 })
    }

    // grading 앱의 users 테이블에 동기화
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    const userData = {
      email: session.user.email,
      name: session.user.name || permissions.email.split('@')[0],
      role: permissions.role === 'admin' ? 'ADMIN' : 
            permissions.role === 'teacher' ? 'TEACHER' : 'USER',
      school_name: permissions.school_name || 'Bluenote School',
      is_active: permissions.is_active ?? true,
      last_login_at: new Date().toISOString()
    }

    let user
    if (existingUser) {
      // 업데이트
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', existingUser.id)
        .select()
        .single()
      
      if (error) throw error
      user = data
    } else {
      // 새로 생성
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      user = data
    }

    // 통합된 사용자 정보 반환
    const integratedUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: permissions.role as UserRole,
      permissions: {
        isAdmin: permissions.role === 'admin',
        canWrite: permissions.can_write || false,
        canGrade: ['admin', 'teacher'].includes(permissions.role),
        canViewAllSubmissions: ['admin', 'teacher'].includes(permissions.role),
        claudeDailyLimit: permissions.claude_daily_limit || 0
      },
      metadata: {
        schoolName: user.school_name,
        lastLoginAt: new Date(user.last_login_at),
        createdAt: new Date(user.created_at),
        updatedAt: new Date()
      }
    }

    return NextResponse.json({
      success: true,
      user: integratedUser
    })
  } catch (error) {
    console.error('User sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}