import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import type { EvaluationResult, TeacherDashboardData } from '@/types/grading';
import { DOMAIN_MAP } from '@/types/grading';
import html2canvas from 'html2canvas';

// Excel export function for teacher dashboard
export function exportToExcel(dashboardData: TeacherDashboardData) {
  const { assignment, classStatistics, evaluationResults } = dashboardData;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary statistics
  const summaryData = [
    ['과제명', assignment.title],
    ['평가 일자', new Date().toLocaleDateString('ko-KR')],
    [''],
    ['학급 통계'],
    ['전체 학생 수', classStatistics.totalStudents],
    ['평가 완료', classStatistics.evaluatedStudents],
    ['학급 평균', classStatistics.averageScore],
    [''],
    ['영역별 평균'],
    ...Object.entries(DOMAIN_MAP).map(([key, label]) => [
      label,
      classStatistics.domainAverages[key as keyof typeof classStatistics.domainAverages]
    ]),
    [''],
    ['등급 분포'],
    ['매우 우수', classStatistics.levelDistribution['매우 우수'] || 0],
    ['우수', classStatistics.levelDistribution['우수'] || 0],
    ['보통', classStatistics.levelDistribution['보통'] || 0],
    ['미흡', classStatistics.levelDistribution['미흡'] || 0],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, '요약');

  // Sheet 2: Detailed evaluation results
  const headers = [
    '학생 이름',
    '학번',
    '반',
    ...Object.values(DOMAIN_MAP),
    '종합 점수',
    '종합 등급'
  ];

  const data = evaluationResults.map(result => [
    result.student.name,
    result.student.studentNumber,
    result.student.class,
    ...Object.keys(DOMAIN_MAP).map(key => 
      `${result.domainEvaluations[key as keyof typeof result.domainEvaluations].level} (${result.domainEvaluations[key as keyof typeof result.domainEvaluations].score}점)`
    ),
    result.overallScore,
    result.overallLevel
  ]);

  const detailSheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Set column widths
  const colWidths = [
    { wch: 12 }, // 학생 이름
    { wch: 10 }, // 학번
    { wch: 8 },  // 반
    { wch: 20 }, // 주장의 명확성
    { wch: 20 }, // 근거의 타당성
    { wch: 20 }, // 논리적 구조
    { wch: 20 }, // 설득력 있는 표현
    { wch: 10 }, // 종합 점수
    { wch: 12 }, // 종합 등급
  ];
  detailSheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, detailSheet, '상세 평가');

  // Generate filename with date
  const fileName = `${assignment.title}_평가결과_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Write file
  XLSX.writeFile(wb, fileName);
}

// PDF export function for individual student report using html2canvas
export async function exportToPDF(evaluationResult: EvaluationResult) {
  // Get the report element
  const reportElement = document.querySelector('.container.mx-auto.py-8.px-4.max-w-7xl');
  if (!reportElement) {
    alert('보고서를 찾을 수 없습니다.');
    return;
  }

  // Hide no-print elements
  const noPrintElements = document.querySelectorAll('.no-print');
  noPrintElements.forEach(el => {
    (el as HTMLElement).style.display = 'none';
  });

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(reportElement as HTMLElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF, handling multiple pages if needed
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    const fileName = `${evaluationResult.student.name}_평가보고서_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

  } finally {
    // Restore no-print elements
    noPrintElements.forEach(el => {
      (el as HTMLElement).style.display = '';
    });
  }
}

// Google Sheets export placeholder (requires OAuth setup)
export async function exportToGoogleSheets(dashboardData: TeacherDashboardData) {
  // This would require Google OAuth and Sheets API setup
  console.log('Google Sheets export requires OAuth setup');
  alert('Google Sheets 연동 기능은 OAuth 설정이 필요합니다.');
}