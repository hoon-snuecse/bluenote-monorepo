import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

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

    // CSV 파일 읽기
    const text = await file.text()
    
    // CSV 파싱 (간단한 파서 구현)
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      return NextResponse.json(
        { error: '데이터가 없습니다.' },
        { status: 400 }
      )
    }

    // 헤더 파싱 (쉼표로 구분, 따옴표 처리)
    const parseCSVLine = (line: string): string[] => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      if (current) {
        result.push(current.trim())
      }
      
      return result
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase())
    
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

    // 필수 필드 확인 (이름만 필수)
    if (fieldMapping.name === -1) {
      return NextResponse.json(
        { error: '이름 열을 찾을 수 없습니다. CSV 파일의 첫 번째 행에 "이름" 헤더가 있는지 확인해주세요.' },
        { status: 400 }
      )
    }

    // 학생 데이터 추출
    const students = []
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i])
      if (!row || row.length === 0) continue

      const name = String(row[fieldMapping.name] || '').trim()
      
      if (!name) continue

      const grade = fieldMapping.grade !== -1 ? String(row[fieldMapping.grade] || '').trim() : undefined
      const classValue = fieldMapping.class !== -1 ? String(row[fieldMapping.class] || '').trim() : undefined
      const number = fieldMapping.number !== -1 ? parseInt(String(row[fieldMapping.number] || '').trim()) || undefined : undefined
      
      // 학번이 없으면 자동 생성
      const studentId = fieldMapping.studentId !== -1 && row[fieldMapping.studentId] 
        ? String(row[fieldMapping.studentId]).trim()
        : `${new Date().getFullYear()}${grade || '0'}${classValue || '0'}${String(number || i).padStart(2, '0')}`

      const student = {
        studentId,
        name,
        email: fieldMapping.email !== -1 ? String(row[fieldMapping.email] || '').trim() : undefined,
        grade,
        class: classValue,
        number
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
      headers: parseCSVLine(lines[0]),
      fieldMapping
    })
  } catch (error) {
    console.error('Error importing CSV file:', error)
    return NextResponse.json(
      { error: 'CSV 파일 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}