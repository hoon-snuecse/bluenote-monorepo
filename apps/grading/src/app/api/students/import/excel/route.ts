import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const groupId = formData.get('groupId') as string

    if (!file || !groupId) {
      return NextResponse.json(
        { error: '파일과 그룹 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일을 ArrayBuffer로 읽기
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 엑셀 파일 파싱
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // JSON으로 변환
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (jsonData.length < 2) {
      return NextResponse.json(
        { error: '데이터가 없습니다.' },
        { status: 400 }
      )
    }

    // 헤더 분석
    const headers = jsonData[0].map(h => String(h).trim().toLowerCase())
    
    // 필드 매핑 찾기
    const fieldMapping = {
      studentId: headers.findIndex(h => 
        h.includes('학번') || h.includes('번호') || h === 'id' || h === 'student id' || h === 'studentid'
      ),
      name: headers.findIndex(h => 
        h.includes('이름') || h.includes('성명') || h === 'name' || h === 'student name'
      ),
      email: headers.findIndex(h => 
        h.includes('이메일') || h.includes('메일') || h === 'email' || h === 'e-mail'
      ),
      grade: headers.findIndex(h => 
        h.includes('학년') || h === 'grade' || h === 'year'
      ),
      class: headers.findIndex(h => 
        h.includes('반') || h === 'class' || h === 'classroom'
      ),
      number: headers.findIndex(h => 
        h.includes('번호') && !h.includes('학번') || h === 'number' || h === 'no'
      )
    }

    // 필수 필드 확인
    if (fieldMapping.studentId === -1 || fieldMapping.name === -1) {
      return NextResponse.json(
        { error: '학번과 이름 열을 찾을 수 없습니다. 엑셀 파일의 첫 번째 행에 "학번"과 "이름" 헤더가 있는지 확인해주세요.' },
        { status: 400 }
      )
    }

    // 학생 데이터 추출
    const students = []
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i]
      if (!row || row.length === 0) continue

      const studentId = String(row[fieldMapping.studentId] || '').trim()
      const name = String(row[fieldMapping.name] || '').trim()
      
      if (!studentId || !name) continue

      const student = {
        studentId,
        name,
        email: fieldMapping.email !== -1 ? String(row[fieldMapping.email] || '').trim() : undefined,
        grade: fieldMapping.grade !== -1 ? String(row[fieldMapping.grade] || '').trim() : undefined,
        class: fieldMapping.class !== -1 ? String(row[fieldMapping.class] || '').trim() : undefined,
        number: fieldMapping.number !== -1 ? String(row[fieldMapping.number] || '').trim() : undefined
      }

      students.push(student)
    }

    if (students.length === 0) {
      return NextResponse.json(
        { error: '유효한 학생 데이터가 없습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      students,
      count: students.length,
      headers: jsonData[0],
      fieldMapping
    })
  } catch (error) {
    console.error('Error importing Excel file:', error)
    return NextResponse.json(
      { error: '엑셀 파일 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}