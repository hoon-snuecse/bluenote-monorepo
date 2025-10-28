import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import prisma from '@/lib/prisma';
import { Document, pdf } from '@react-pdf/renderer';
import { CoverPage } from '@/components/pdf/CoverPage';
import { TableOfContents } from '@/components/pdf/TableOfContents';
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
    const tocPages = Math.ceil(evaluatedSubmissions.length / 30);
    let currentPage = 1 + tocPages; // 표지(1페이지) + 목차(tocPages 페이지)

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
    // TableOfContents는 JSX fragment를 반환하므로, 먼저 렌더링해서 페이지들을 얻어야 함
    const tocElement = React.createElement(TableOfContents, { students: tocStudents });

    const CombinedPDFDocument = () =>
      React.createElement(
        Document,
        null,
        // 1. 표지 페이지
        React.createElement(CoverPage, coverPageData),
        // 2. 목차 페이지(들)
        tocElement,
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
