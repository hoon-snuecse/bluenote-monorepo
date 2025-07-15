import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

const ASSIGNMENTS_DIR = path.join(process.cwd(), 'data', 'assignments');
const EVALUATIONS_DIR = path.join(process.cwd(), 'data', 'evaluations');
const SUBMISSIONS_DIR = path.join(process.cwd(), 'data', 'submissions');

export async function POST(request: NextRequest) {
  try {
    const { assignmentId } = await request.json();
    
    // 과제 정보 가져오기
    const assignmentPath = path.join(ASSIGNMENTS_DIR, `${assignmentId}.json`);
    const assignmentContent = await fs.readFile(assignmentPath, 'utf-8');
    const assignment = JSON.parse(assignmentContent);
    
    // 평가 결과 가져오기
    const evaluationFiles = await fs.readdir(EVALUATIONS_DIR).catch(() => []);
    const submissionFiles = await fs.readdir(SUBMISSIONS_DIR).catch(() => []);
    
    const evaluationResults = [];
    
    // 모든 평가 파일 읽기
    for (const file of evaluationFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(EVALUATIONS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const evaluation = JSON.parse(content);
        
        if (evaluation.assignmentId === assignmentId) {
          // 해당 제출물 정보 찾기
          let submission = null;
          for (const subFile of submissionFiles) {
            if (subFile.endsWith('.json')) {
              const subPath = path.join(SUBMISSIONS_DIR, subFile);
              const subContent = await fs.readFile(subPath, 'utf-8');
              const sub = JSON.parse(subContent);
              
              if (sub.id === evaluation.submissionId) {
                submission = sub;
                break;
              }
            }
          }
          
          if (submission) {
            evaluationResults.push({
              ...evaluation,
              studentName: submission.studentName,
              studentId: submission.studentId,
              submittedAt: submission.submittedAt,
            });
          }
        }
      }
    }
    
    // 학생 이름순으로 정렬
    evaluationResults.sort((a, b) => a.studentName.localeCompare(b.studentName, 'ko'));
    
    // Excel 워크북 생성
    const wb = XLSX.utils.book_new();
    
    // 1. 요약 시트
    const summaryData = [
      ['과제 정보'],
      ['제목', assignment.title],
      ['학교', assignment.schoolName],
      ['학년', assignment.gradeLevel],
      ['글 종류', assignment.writingType],
      ['평가일', new Date().toLocaleDateString('ko-KR')],
      [''],
      ['평가 수준별 분포'],
      ['수준', '인원', '비율']
    ];
    
    // 수준별 통계 계산
    const levelStats = {};
    assignment.evaluationLevels.forEach(level => {
      levelStats[level] = evaluationResults.filter(e => e.overallLevel === level).length;
    });
    
    assignment.evaluationLevels.forEach(level => {
      const count = levelStats[level];
      const percentage = evaluationResults.length > 0 ? (count / evaluationResults.length * 100).toFixed(1) : '0';
      summaryData.push([level, count, `${percentage}%`]);
    });
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // 열 너비 설정
    summarySheet['!cols'] = [
      { wch: 15 }, // A열
      { wch: 30 }, // B열
      { wch: 10 }, // C열
    ];
    
    XLSX.utils.book_append_sheet(wb, summarySheet, '요약');
    
    // 2. 평가 결과 시트
    const headers = ['학번', '이름', ...assignment.evaluationDomains, '종합평가', '제출일시'];
    const data = [headers];
    
    evaluationResults.forEach(evaluation => {
      const row = [
        evaluation.studentId,
        evaluation.studentName,
        ...assignment.evaluationDomains.map(domain => 
          evaluation.domainEvaluations[domain]?.level || '-'
        ),
        evaluation.overallLevel,
        new Date(evaluation.submittedAt).toLocaleString('ko-KR')
      ];
      data.push(row);
    });
    
    const resultsSheet = XLSX.utils.aoa_to_sheet(data);
    
    // 헤더 스타일 설정
    const headerRange = XLSX.utils.decode_range(resultsSheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!resultsSheet[cellAddress]) continue;
      
      resultsSheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E0E0E0" } },
        alignment: { horizontal: "center" }
      };
    }
    
    // 열 너비 설정
    const colWidths = [
      { wch: 12 }, // 학번
      { wch: 15 }, // 이름
      ...assignment.evaluationDomains.map(() => ({ wch: 15 })), // 평가 영역들
      { wch: 15 }, // 종합평가
      { wch: 20 }, // 제출일시
    ];
    resultsSheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, resultsSheet, '평가결과');
    
    // 3. 상세 피드백 시트
    const feedbackHeaders = ['학번', '이름', '영역', '수준', '피드백'];
    const feedbackData = [feedbackHeaders];
    
    evaluationResults.forEach(evaluation => {
      // 영역별 피드백
      assignment.evaluationDomains.forEach(domain => {
        const domainEval = evaluation.domainEvaluations[domain];
        if (domainEval) {
          feedbackData.push([
            evaluation.studentId,
            evaluation.studentName,
            domain,
            domainEval.level,
            domainEval.feedback
          ]);
        }
      });
      
      // 종합 피드백
      feedbackData.push([
        evaluation.studentId,
        evaluation.studentName,
        '종합평가',
        evaluation.overallLevel,
        evaluation.overallFeedback
      ]);
      
      // 개선방안
      if (evaluation.improvementSuggestions) {
        feedbackData.push([
          evaluation.studentId,
          evaluation.studentName,
          '개선방안',
          '-',
          evaluation.improvementSuggestions
        ]);
      }
      
      // 구분선
      feedbackData.push(['', '', '', '', '']);
    });
    
    const feedbackSheet = XLSX.utils.aoa_to_sheet(feedbackData);
    
    // 열 너비 설정
    feedbackSheet['!cols'] = [
      { wch: 12 }, // 학번
      { wch: 15 }, // 이름
      { wch: 20 }, // 영역
      { wch: 15 }, // 수준
      { wch: 80 }, // 피드백
    ];
    
    XLSX.utils.book_append_sheet(wb, feedbackSheet, '상세피드백');
    
    // Excel 파일 생성
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // 파일명 생성
    const fileName = `${assignment.title}_평가결과_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
    
  } catch (error) {
    console.error('Excel 내보내기 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Excel 파일 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}