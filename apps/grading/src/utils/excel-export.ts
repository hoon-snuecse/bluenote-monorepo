import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExportStudent {
  name: string;
  documentName: string;
  evaluationStatus: string;
  scores: {
    clarity: number;
    evidence: number;
    structure: number;
    expression: number;
    overall: number;
  };
  grade: string;
  feedback?: {
    clarity: string;
    evidence: string;
    structure: string;
    expression: string;
    overall: string;
  };
}

export const exportToExcel = (students: ExportStudent[], fileName: string = '평가결과') => {
  // Create main data for the summary sheet
  const summaryData = students.map(student => ({
    '이름': student.name,
    '문서명': student.documentName,
    '평가상태': student.evaluationStatus === 'completed' ? '완료' : 
                student.evaluationStatus === 'in_progress' ? '진행중' : '대기',
    '주장의 명확성': student.evaluationStatus === 'completed' ? student.scores.clarity : '-',
    '근거의 타당성': student.evaluationStatus === 'completed' ? student.scores.evidence : '-',
    '논리적 구조': student.evaluationStatus === 'completed' ? student.scores.structure : '-',
    '설득력 있는 표현': student.evaluationStatus === 'completed' ? student.scores.expression : '-',
    '종합점수': student.evaluationStatus === 'completed' ? student.scores.overall : '-',
    '등급': student.evaluationStatus === 'completed' ? student.grade : '-',
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(summaryData);

  // Set column widths
  const wscols = [
    { wch: 10 }, // 이름
    { wch: 25 }, // 문서명
    { wch: 10 }, // 평가상태
    { wch: 12 }, // 주장의 명확성
    { wch: 12 }, // 근거의 타당성
    { wch: 12 }, // 논리적 구조
    { wch: 15 }, // 설득력 있는 표현
    { wch: 10 }, // 종합점수
    { wch: 10 }, // 등급
  ];
  ws['!cols'] = wscols;

  // Add the summary sheet
  XLSX.utils.book_append_sheet(wb, ws, '평가 요약');

  // Create detailed sheets for completed evaluations
  const completedStudents = students.filter(s => s.evaluationStatus === 'completed' && s.feedback);
  
  if (completedStudents.length > 0) {
    // Create detailed feedback sheet
    const detailData = completedStudents.map(student => ({
      '이름': student.name,
      '종합점수': student.scores.overall,
      '등급': student.grade,
      '주장의 명확성 피드백': student.feedback?.clarity || '',
      '근거의 타당성 피드백': student.feedback?.evidence || '',
      '논리적 구조 피드백': student.feedback?.structure || '',
      '설득력 있는 표현 피드백': student.feedback?.expression || '',
      '종합 평가': student.feedback?.overall || '',
    }));

    const wsDetail = XLSX.utils.json_to_sheet(detailData);
    
    // Set column widths for detail sheet
    const wscolsDetail = [
      { wch: 10 }, // 이름
      { wch: 10 }, // 종합점수
      { wch: 10 }, // 등급
      { wch: 40 }, // 주장의 명확성 피드백
      { wch: 40 }, // 근거의 타당성 피드백
      { wch: 40 }, // 논리적 구조 피드백
      { wch: 40 }, // 설득력 있는 표현 피드백
      { wch: 50 }, // 종합 평가
    ];
    wsDetail['!cols'] = wscolsDetail;

    XLSX.utils.book_append_sheet(wb, wsDetail, '상세 피드백');
  }

  // Add statistics sheet
  const completedCount = students.filter(s => s.evaluationStatus === 'completed').length;
  const averageScores = completedCount > 0 ? {
    clarity: Math.round(completedStudents.reduce((sum, s) => sum + s.scores.clarity, 0) / completedCount),
    evidence: Math.round(completedStudents.reduce((sum, s) => sum + s.scores.evidence, 0) / completedCount),
    structure: Math.round(completedStudents.reduce((sum, s) => sum + s.scores.structure, 0) / completedCount),
    expression: Math.round(completedStudents.reduce((sum, s) => sum + s.scores.expression, 0) / completedCount),
    overall: Math.round(completedStudents.reduce((sum, s) => sum + s.scores.overall, 0) / completedCount),
  } : { clarity: 0, evidence: 0, structure: 0, expression: 0, overall: 0 };

  const gradeDistribution = {
    '매우 우수': students.filter(s => s.grade === '매우 우수').length,
    '우수': students.filter(s => s.grade === '우수').length,
    '보통': students.filter(s => s.grade === '보통').length,
    '미흡': students.filter(s => s.grade === '미흡').length,
  };

  const statsData = [
    { '항목': '총 학생 수', '값': students.length },
    { '항목': '평가 완료', '값': completedCount },
    { '항목': '평가 대기', '값': students.filter(s => s.evaluationStatus === 'pending').length },
    { '항목': '', '값': '' },
    { '항목': '평균 점수', '값': '' },
    { '항목': '주장의 명확성', '값': averageScores.clarity },
    { '항목': '근거의 타당성', '값': averageScores.evidence },
    { '항목': '논리적 구조', '값': averageScores.structure },
    { '항목': '설득력 있는 표현', '값': averageScores.expression },
    { '항목': '종합 점수', '값': averageScores.overall },
    { '항목': '', '값': '' },
    { '항목': '등급 분포', '값': '' },
    { '항목': '매우 우수', '값': gradeDistribution['매우 우수'] },
    { '항목': '우수', '값': gradeDistribution['우수'] },
    { '항목': '보통', '값': gradeDistribution['보통'] },
    { '항목': '미흡', '값': gradeDistribution['미흡'] },
  ];

  const wsStats = XLSX.utils.json_to_sheet(statsData);
  wsStats['!cols'] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsStats, '통계');

  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

  // Convert to blob and save
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const timestamp = new Date().toISOString().split('T')[0];
  saveAs(blob, `${fileName}_${timestamp}.xlsx`);
};