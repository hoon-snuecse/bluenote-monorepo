import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('[Create Tables] Starting table creation')
    
    // StudentGroup 테이블 생성
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "StudentGroup" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "schoolName" TEXT NOT NULL,
        "gradeLevel" TEXT,
        "className" TEXT,
        "schoolYear" TEXT NOT NULL,
        "createdBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "StudentGroup_pkey" PRIMARY KEY ("id")
      )
    `
    
    // Student 테이블 생성
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Student" (
        "id" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "groupId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
      )
    `
    
    // 인덱스 생성
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "StudentGroup_createdBy_idx" ON "StudentGroup"("createdBy")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "StudentGroup_schoolName_idx" ON "StudentGroup"("schoolName")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "StudentGroup_gradeLevel_idx" ON "StudentGroup"("gradeLevel")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "StudentGroup_className_idx" ON "StudentGroup"("className")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "StudentGroup_schoolYear_idx" ON "StudentGroup"("schoolYear")`
    
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Student_groupId_idx" ON "Student"("groupId")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Student_studentId_idx" ON "Student"("studentId")`
    
    // Unique constraint
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Student_studentId_groupId_key" 
      ON "Student"("studentId", "groupId")
    `
    
    // Foreign key
    await prisma.$executeRaw`
      ALTER TABLE "Student" 
      ADD CONSTRAINT "Student_groupId_fkey" 
      FOREIGN KEY ("groupId") REFERENCES "StudentGroup"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `
    
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