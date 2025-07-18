import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// User role constants
const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  TEACHER: 'teacher'
}

// GET: 현재 사용자의 권한 정보 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const { data: permissions, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (error || !permissions) {
      // 권한이 없는 경우 기본값 반환
      return NextResponse.json({
        email: session.user.email,
        role: UserRole.USER,
        permissions: {
          isAdmin: false,
          canWrite: false,
          canGrade: false,
          canViewAllSubmissions: false,
          claudeDailyLimit: 0
        }
      })
    }

    // 권한 정보 구성
    const userPermissions = {
      email: permissions.email,
      role: permissions.role || UserRole.USER,
      permissions: {
        isAdmin: permissions.role === 'admin',
        canWrite: permissions.can_write || false,
        canGrade: ['admin', 'teacher'].includes(permissions.role),
        canViewAllSubmissions: ['admin', 'teacher'].includes(permissions.role),
        claudeDailyLimit: permissions.claude_daily_limit || 0
      },
      metadata: {
        createdAt: permissions.created_at,
        updatedAt: permissions.updated_at
      }
    }

    return NextResponse.json(userPermissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: 사용자 권한 업데이트 (관리자 전용)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { email, role, canWrite, claudeDailyLimit } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // 기존 권한 확인
    const { data: existing } = await supabase
      .from('user_permissions')
      .select('email')
      .eq('email', email)
      .single()

    const permissionData = {
      email,
      role: role || UserRole.USER,
      can_write: canWrite || false,
      claude_daily_limit: claudeDailyLimit || 3,
      is_active: true,
      updated_at: new Date().toISOString()
    }

    let result
    if (existing) {
      // 업데이트
      result = await supabase
        .from('user_permissions')
        .update(permissionData)
        .eq('email', email)
        .select()
        .single()
    } else {
      // 새로 생성
      result = await supabase
        .from('user_permissions')
        .insert({
          ...permissionData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
    }

    if (result.error) {
      throw result.error
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Error updating permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}