import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'excel'
    const lang = searchParams.get('lang') || 'ko'

    // 헤더 정의
    const headers = lang === 'ko' 
      ? ['학번', '이름', '이메일', '학년', '반', '번호']
      : ['Student ID', 'Name', 'Email', 'Grade', 'Class', 'Number']

    // 샘플 데이터
    const sampleData = lang === 'ko'
      ? [
          ['20240001', '김민준', 'minjun.kim@example.com', '1', '1', '1'],
          ['20240002', '이서연', 'seoyeon.lee@example.com', '1', '1', '2'],
          ['20240003', '박지호', 'jiho.park@example.com', '1', '1', '3']
        ]
      : [
          ['20240001', 'Kim Min Jun', 'minjun.kim@example.com', '1', '1', '1'],
          ['20240002', 'Lee Seo Yeon', 'seoyeon.lee@example.com', '1', '1', '2'],
          ['20240003', 'Park Ji Ho', 'jiho.park@example.com', '1', '1', '3']
        ]

    if (format === 'csv') {
      // CSV 형식으로 생성
      const csvContent = [
        headers.join(','),
        ...sampleData.map(row => row.join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="student_template_${lang}.csv"`,
        },
      })
    } else {
      // Excel 형식으로 생성
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData])
      
      // 열 너비 설정
      ws['!cols'] = [
        { wch: 15 }, // 학번
        { wch: 15 }, // 이름
        { wch: 30 }, // 이메일
        { wch: 10 }, // 학년
        { wch: 10 }, // 반
        { wch: 10 }, // 번호
      ]

      // 스타일 설정 (헤더를 굵게)
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:F4')
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C })
        if (!ws[address]) continue
        ws[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'EEEEEE' } }
        }
      }

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, lang === 'ko' ? '학생명단' : 'Student List')

      // 파일 생성
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="student_template_${lang}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: '템플릿 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}