import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';

// 종합 보고서 생성 API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assignmentId = searchParams.get('assignmentId');
    const format = searchParams.get('format') || 'excel'; // excel, pdf, json

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: '과제 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 과제 정보 조회
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        evaluations: {
          include: {
            submission: {
              select: {
                studentName: true,
                studentId: true,
                submittedAt: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: '과제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 평가 데이터 정리
    const evaluationData = assignment.evaluations.map(evaluation => {
      const domainEvaluations = typeof evaluation.domainEvaluations === 'string' 
        ? JSON.parse(evaluation.domainEvaluations) 
        : evaluation.domainEvaluations;
      
      // 각 도메인의 점수 계산
      const scores: any = {};
      let totalScore = 0;
      let domainCount = 0;

      if (domainEvaluations && typeof domainEvaluations === 'object') {
        Object.entries(domainEvaluations).forEach(([domain, evalData]: [string, any]) => {
          if (evalData && evalData.score !== undefined) {
            scores[domain] = evalData.score;
            totalScore += evalData.score;
            domainCount++;
          }
        });
      }

      const averageScore = domainCount > 0 ? Math.round(totalScore / domainCount) : 0;

      return {
        studentId: evaluation.studentId,
        studentName: evaluation.submission?.studentName || evaluation.studentId,
        submittedAt: evaluation.submission?.submittedAt,
        evaluatedAt: evaluation.evaluatedAt,
        overallLevel: evaluation.overallLevel,
        averageScore,
        scores,
        overallFeedback: evaluation.overallFeedback,
        improvementSuggestions: typeof evaluation.improvementSuggestions === 'string'
          ? JSON.parse(evaluation.improvementSuggestions)
          : evaluation.improvementSuggestions,
        strengths: typeof evaluation.strengths === 'string'
          ? JSON.parse(evaluation.strengths)
          : evaluation.strengths,
      };
    });

    // 통계 계산
    const statistics = {
      totalStudents: evaluationData.length,
      evaluatedCount: evaluationData.filter(e => e.evaluatedAt).length,
      averageClassScore: evaluationData.reduce((sum, e) => sum + e.averageScore, 0) / evaluationData.length,
      levelDistribution: {
        '매우 우수': evaluationData.filter(e => e.averageScore >= 90).length,
        '우수': evaluationData.filter(e => e.averageScore >= 80 && e.averageScore < 90).length,
        '보통': evaluationData.filter(e => e.averageScore >= 70 && e.averageScore < 80).length,
        '미흡': evaluationData.filter(e => e.averageScore < 70).length,
      }
    };

    // 형식에 따른 응답 생성
    switch (format) {
      case 'json':
        return NextResponse.json({
          success: true,
          assignment: {
            id: assignment.id,
            title: assignment.title,
            schoolName: assignment.schoolName,
            gradeLevel: assignment.gradeLevel,
            writingType: assignment.writingType,
            createdAt: assignment.createdAt
          },
          statistics,
          evaluations: evaluationData
        });

      case 'excel':
        // Excel 파일 생성
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('평가 결과');

        // 헤더 설정
        worksheet.columns = [
          { header: '학번', key: 'studentId', width: 15 },
          { header: '이름', key: 'studentName', width: 15 },
          { header: '제출일시', key: 'submittedAt', width: 20 },
          { header: '평가일시', key: 'evaluatedAt', width: 20 },
          { header: '평균점수', key: 'averageScore', width: 10 },
          { header: '수준', key: 'overallLevel', width: 10 },
          { header: '명료성', key: 'clarity', width: 10 },
          { header: '타당성', key: 'validity', width: 10 },
          { header: '구조', key: 'structure', width: 10 },
          { header: '표현', key: 'expression', width: 10 },
          { header: '종합평가', key: 'overallFeedback', width: 50 },
        ];

        // 데이터 추가
        evaluationData.forEach(evaluation => {
          worksheet.addRow({
            studentId: evaluation.studentId,
            studentName: evaluation.studentName,
            submittedAt: evaluation.submittedAt,
            evaluatedAt: evaluation.evaluatedAt,
            averageScore: evaluation.averageScore,
            overallLevel: evaluation.overallLevel,
            clarity: evaluation.scores.clarity || '-',
            validity: evaluation.scores.validity || '-',
            structure: evaluation.scores.structure || '-',
            expression: evaluation.scores.expression || '-',
            overallFeedback: evaluation.overallFeedback
          });
        });

        // 스타일 적용
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };

        // 통계 시트 추가
        const statsSheet = workbook.addWorksheet('통계');
        statsSheet.addRow(['통계 항목', '값']);
        statsSheet.addRow(['전체 학생 수', statistics.totalStudents]);
        statsSheet.addRow(['평가 완료 수', statistics.evaluatedCount]);
        statsSheet.addRow(['평균 점수', statistics.averageClassScore.toFixed(1)]);
        statsSheet.addRow(['']);
        statsSheet.addRow(['수준별 분포', '']);
        Object.entries(statistics.levelDistribution).forEach(([level, count]) => {
          statsSheet.addRow([level, count]);
        });

        // Excel 파일을 버퍼로 변환
        const buffer = await workbook.xlsx.writeBuffer();
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="evaluation_report_${assignmentId}_${new Date().toISOString().split('T')[0]}.xlsx"`
          }
        });

      case 'pdf':
        // PDF 생성은 한글 폰트 처리가 필요하므로 별도 구현 필요
        return NextResponse.json(
          { success: false, error: 'PDF 형식은 준비 중입니다.' },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 형식입니다.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('보고서 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '보고서 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}