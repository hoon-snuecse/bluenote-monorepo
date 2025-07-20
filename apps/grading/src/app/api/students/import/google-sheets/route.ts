import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { google } from 'googleapis'
import { getGoogleClient } from '@/lib/google-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { spreadsheetId, groupId } = body

    if (!spreadsheetId || !groupId) {
      return NextResponse.json(
        { error: '스프레드시트 ID와 그룹 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // Google OAuth 클라이언트 가져오기
    const oauth2Client = await getGoogleClient(session.user.email)
    if (!oauth2Client) {
      return NextResponse.json(
        { error: 'Google 인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // Google Sheets API 초기화
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client })

    // 스프레드시트 메타데이터 가져오기
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    })

    // 첫 번째 시트 가져오기
    const firstSheet = spreadsheet.data.sheets?.[0]
    if (!firstSheet) {
      return NextResponse.json(
        { error: '스프레드시트에 시트가 없습니다.' },
        { status: 400 }
      )
    }

    const sheetName = firstSheet.properties?.title || 'Sheet1'

    // 데이터 읽기 (A1:Z1000 범위로 충분히 크게 설정)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`
    })

    const rows = response.data.values
    if (!rows || rows.length < 2) {
      return NextResponse.json(
        { error: '스프레드시트에 데이터가 없습니다.' },
        { status: 400 }
      )
    }

    // 헤더 분석
    const headers = rows[0].map(h => String(h).trim().toLowerCase())
    
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
        { error: '학번과 이름 열을 찾을 수 없습니다. 스프레드시트의 첫 번째 행에 "학번"과 "이름" 헤더가 있는지 확인해주세요.' },
        { status: 400 }
      )
    }

    // 학생 데이터 추출
    const students = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
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

    // 스프레드시트 정보도 함께 반환
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'properties.title'
    })

    return NextResponse.json({
      success: true,
      students,
      count: students.length,
      headers: rows[0],
      fieldMapping,
      spreadsheetTitle: spreadsheetInfo.data.properties?.title
    })
  } catch (error: any) {
    console.error('Error importing Google Sheets:', error)
    
    // Google API 에러 처리
    if (error.code === 404) {
      return NextResponse.json(
        { error: '스프레드시트를 찾을 수 없습니다. ID를 확인해주세요.' },
        { status: 404 }
      )
    } else if (error.code === 403) {
      return NextResponse.json(
        { error: '스프레드시트에 접근 권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Google Sheets 가져오기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}