import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import prisma from '@/lib/prisma';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { CoverPage } from '@/components/pdf/CoverPage';
import { StudentReportPDF } from '@/components/pdf/StudentReportPDF';
import { registerKoreanFonts } from '@/lib/pdf-font-setup';
import { getSessionWithPermissions } from '@/lib/auth-helpers';

/**
 * 통합 PDF 생성 API
 *
 * POST /api/export/combined-pdf
 * Body: { assignmentId, submissionIds? }
 *
 * 응답: PDF 파일 (표지 + 목차 + 개인 보고서들)
 */
export async function POST(request: NextRequest) {
  try {
    // 한글 폰트 등록
    registerKoreanFonts();

    // 인증 확인 (개별 PDF와 동일한 방식)
    const session = await getSessionWithPermissions();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { assignmentId, submissionIds } = await request.json();

    // 1. 과제 정보 조회
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. 제출물 및 평가 조회
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId,
        ...(submissionIds && submissionIds.length > 0 && {
          id: { in: submissionIds },
        }),
      },
      include: {
        evaluations: {
          orderBy: { evaluatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { studentName: 'asc' },
    });

    // 평가 완료된 제출물만 필터링
    const evaluatedSubmissions = submissions.filter(
      (s) => s.evaluations.length > 0
    );

    if (evaluatedSubmissions.length === 0) {
      return NextResponse.json(
        { success: false, error: '평가 완료된 학생이 없습니다.' },
        { status: 400 }
      );
    }

    // 3. JSON 필드 파싱
    const evaluationDomains = parseJSON(assignment.evaluationDomains);
    const evaluationLevels = parseJSON(assignment.evaluationLevels);

    // 4. 통계 계산
    const levelDistribution: Record<string, number> = {};
    evaluationLevels.forEach((level: string) => {
      levelDistribution[level] = evaluatedSubmissions.filter(
        (s) => s.evaluations[0].overallLevel === level
      ).length;
    });

    // 5. 날짜 정보 수집
    const submittedDates = evaluatedSubmissions.map((s) => new Date(s.submittedAt));
    const evaluatedDates = evaluatedSubmissions.map(
      (s) => new Date(s.evaluations[0].evaluatedAt)
    );

    const dateInfo = {
      submissionStart: new Date(Math.min(...submittedDates.map((d) => d.getTime()))),
      submissionEnd: new Date(Math.max(...submittedDates.map((d) => d.getTime()))),
      evaluationDate: new Date(Math.max(...evaluatedDates.map((d) => d.getTime()))),
      reportGeneratedDate: new Date(),
    };

    // 6. 표지 데이터
    const coverPageData = {
      assignment: {
        title: assignment.title,
        schoolName: assignment.schoolName,
        gradeLevel: assignment.gradeLevel,
        className: undefined, // TODO: 실제 반 정보 추가 필요
      },
      statistics: {
        totalStudents: submissions.length,
        evaluatedStudents: evaluatedSubmissions.length,
        levelDistribution,
      },
      dateInfo,
      evaluationModel:
        evaluatedSubmissions[0].evaluations[0].evaluatedBy || 'Claude Sonnet 4.5',
    };

    // 7. 목차 데이터 (페이지 번호 계산)
    // 목차 페이지 수 계산 (30명당 1페이지)
    const tocPageCount = Math.ceil(evaluatedSubmissions.length / 30);
    let currentPage = 1 + tocPageCount; // 표지(1페이지) + 목차(tocPageCount 페이지)

    const tocStudents = evaluatedSubmissions.map((submission, index) => {
      const pageNumber = currentPage;
      // 개인 보고서는 3페이지로 구성
      currentPage += 3;

      return {
        name: submission.studentName,
        studentId: submission.studentId,
        overallLevel: submission.evaluations[0].overallLevel,
        pageNumber,
      };
    });

    // 8. PDF 문서 생성
    // 목차 페이지들을 미리 생성
    const tocPages = createTableOfContentsPages(tocStudents);

    const CombinedPDFDocument = () =>
      React.createElement(
        Document,
        null,
        // 1. 표지 페이지
        React.createElement(CoverPage, coverPageData),
        // 2. 목차 페이지(들)
        ...tocPages,
        // 3. 개별 학생 보고서들
        ...evaluatedSubmissions.map((submission) => {
          const evaluation = submission.evaluations[0];
          const improvementSuggestions = parseJSON(evaluation.improvementSuggestions);
          const strengths = parseJSON(evaluation.strengths);

          return React.createElement(StudentReportPDF, {
            key: submission.id,
            evaluation: {
              id: evaluation.id,
              domainEvaluations: parseJSON(evaluation.domainEvaluations),
              overallLevel: evaluation.overallLevel,
              overallFeedback: evaluation.overallFeedback,
              improvementSuggestions: Array.isArray(improvementSuggestions)
                ? improvementSuggestions
                : [improvementSuggestions],
              strengths: Array.isArray(strengths) ? strengths : [strengths],
              evaluatedAt: new Date(evaluation.evaluatedAt),
              evaluatedBy: evaluation.evaluatedBy || undefined,
            },
            assignment: {
              title: assignment.title,
              schoolName: assignment.schoolName,
              gradeLevel: assignment.gradeLevel,
              writingType: assignment.writingType,
              evaluationDomains,
              evaluationLevels,
            },
            student: {
              name: submission.studentName,
              studentId: submission.studentId,
            },
            submission: {
              content: submission.content,
              submittedAt: new Date(submission.submittedAt),
            },
          });
        })
      );

    // 9. PDF 렌더링
    const pdfBlob = await pdf(React.createElement(CombinedPDFDocument)).toBlob();
    const pdfBuffer = await pdfBlob.arrayBuffer();

    // 10. 파일명 생성
    const studentCount = evaluatedSubmissions.length;
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${assignment.title}_평가보고서_${studentCount}명_${dateStr}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    console.error('Combined PDF generation error:', error);
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        success: false,
        error: 'PDF 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * JSON 파싱 유틸리티
 * Prisma가 JSON 필드를 string으로 반환할 수 있으므로 안전하게 파싱
 */
function parseJSON(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

/**
 * 목차 페이지 생성 헬퍼
 * TableOfContents 컴포넌트가 Fragment를 반환하는 문제를 해결하기 위해
 * 직접 Page 배열을 생성
 */
function createTableOfContentsPages(students: Array<{
  name: string;
  studentId: string;
  overallLevel: string;
  pageNumber: number;
}>) {
  const studentsPerPage = 30;
  const totalPages = Math.ceil(students.length / studentsPerPage);

  const tocStyles = StyleSheet.create({
    page: {
      fontFamily: 'NotoSansKR',
      padding: 50,
      backgroundColor: '#FFFFFF',
      fontSize: 10,
    },
    header: {
      marginBottom: 25,
      borderBottomWidth: 2,
      borderBottomColor: '#3b82f6',
      paddingBottom: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 700,
      color: '#1e293b',
    },
    pageInfo: {
      fontSize: 11,
      color: '#64748b',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f1f5f9',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#cbd5e1',
      padding: 8,
    },
    tableHeaderCell: {
      fontSize: 10,
      fontWeight: 700,
      color: '#475569',
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
      padding: 8,
    },
    tableRowEven: {
      backgroundColor: '#f9fafb',
    },
    tableCell: {
      fontSize: 10,
      color: '#1e293b',
      textAlign: 'center',
    },
    colNumber: { width: 50 },
    colName: { width: 150, textAlign: 'left', paddingLeft: 10 },
    colStudentId: { width: 100 },
    colLevel: { width: 120 },
    colPage: { width: 70 },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 50,
      right: 50,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      paddingTop: 15,
    },
    footerText: {
      fontSize: 10,
      color: '#94a3b8',
    },
  });

  const getLevelColor = (level: string): string => {
    if (level.includes('매우 우수') || level.includes('매우우수')) return '#10b981';
    if (level.includes('우수')) return '#3b82f6';
    if (level.includes('보통')) return '#f59e0b';
    if (level.includes('미흡')) return '#ef4444';
    return '#64748b';
  };

  return Array.from({ length: totalPages }, (_, pageIndex) => {
    const startIndex = pageIndex * studentsPerPage;
    const endIndex = Math.min(startIndex + studentsPerPage, students.length);
    const pageStudents = students.slice(startIndex, endIndex);

    return React.createElement(
      Page,
      { key: `toc-${pageIndex}`, size: 'A4', style: tocStyles.page },
      // Header
      React.createElement(
        View,
        { style: tocStyles.header },
        React.createElement(Text, { style: tocStyles.title }, '목차'),
        ...(totalPages > 1 ? [React.createElement(
          Text,
          { style: tocStyles.pageInfo },
          `${pageIndex + 1} / ${totalPages}`
        )] : [])
      ),
      // Table Header
      React.createElement(
        View,
        { style: tocStyles.tableHeader },
        React.createElement(Text, { style: [tocStyles.tableHeaderCell, tocStyles.colNumber] }, '번호'),
        React.createElement(Text, { style: [tocStyles.tableHeaderCell, tocStyles.colName] }, '학생 이름'),
        React.createElement(Text, { style: [tocStyles.tableHeaderCell, tocStyles.colStudentId] }, '학번'),
        React.createElement(Text, { style: [tocStyles.tableHeaderCell, tocStyles.colLevel] }, '종합 평가'),
        React.createElement(Text, { style: [tocStyles.tableHeaderCell, tocStyles.colPage] }, '페이지')
      ),
      // Table Rows
      ...pageStudents.map((student, index) => {
        const globalIndex = startIndex + index + 1;
        const isEven = globalIndex % 2 === 0;
        const levelColor = getLevelColor(student.overallLevel);

        return React.createElement(
          View,
          {
            key: student.studentId,
            style: isEven ? [tocStyles.tableRow, tocStyles.tableRowEven] : tocStyles.tableRow,
          },
          React.createElement(Text, { style: [tocStyles.tableCell, tocStyles.colNumber] }, String(globalIndex)),
          React.createElement(Text, { style: [tocStyles.tableCell, tocStyles.colName] }, student.name),
          React.createElement(Text, { style: [tocStyles.tableCell, tocStyles.colStudentId] }, student.studentId),
          React.createElement(
            Text,
            { style: [tocStyles.tableCell, tocStyles.colLevel] },
            React.createElement(
              Text,
              { style: { color: levelColor, fontWeight: levelColor === '#64748b' ? 400 : 700 } },
              student.overallLevel
            )
          ),
          React.createElement(Text, { style: [tocStyles.tableCell, tocStyles.colPage] }, String(student.pageNumber))
        );
      }),
      // Footer
      React.createElement(
        View,
        { style: tocStyles.footer },
        React.createElement(
          Text,
          { style: tocStyles.footerText },
          `총 ${students.length}명의 학생 평가 보고서`
        )
      )
    );
  });
}
