import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // PostgreSQL의 information_schema를 사용하여 테이블 목록 조회
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    ` as any[]

    // 각 테이블의 행 수 확인
    const tableInfo = []
    for (const table of tables) {
      try {
        const countResult = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "${table.table_name}"`
        ) as any[]
        tableInfo.push({
          table: table.table_name,
          rowCount: parseInt(countResult[0].count)
        })
      } catch (e) {
        tableInfo.push({
          table: table.table_name,
          rowCount: 'error',
          error: e instanceof Error ? e.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalTables: tables.length,
      tables: tableInfo,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Test Schema] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Schema test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name
      }
    }, { status: 500 })
  }
}