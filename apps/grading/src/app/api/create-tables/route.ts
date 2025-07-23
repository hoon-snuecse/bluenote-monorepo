import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('[Create Tables] Starting table creation')
    
    // 필요한 테이블들을 여기에 생성
    // 현재는 StudentGroup과 Student 테이블을 사용하지 않으므로 제거됨
    
    return NextResponse.json({
      success: true,
      message: 'Tables created successfully'
    })
  } catch (error) {
    console.error('[Create Tables] Error:', error)
    
    // 외래 키 제약 조건이 이미 존재하는 경우 무시
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json({
        success: true,
        message: 'Tables already exist',
        details: error.message
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create tables',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name
      }
    }, { status: 500 })
  }
}