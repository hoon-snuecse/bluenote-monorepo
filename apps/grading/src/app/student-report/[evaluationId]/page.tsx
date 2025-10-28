'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { GrowthStageIndicator } from '@/components/GrowthStageIndicator';
import { ArrowLeft, Download, Printer, BookOpen, Target, MessageSquare, TrendingUp, FileText, Code } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EvaluationData {
  id: string;
  submissionId: string;
  studentName: string;
  studentId: string;
  submittedAt: string;
  domainEvaluations: Record<string, {
    level: string;
    feedback: string;
    score: number;
  }>;
  overallLevel: string;
  overallFeedback: string;
  improvementSuggestions: string;
  evaluatedAt: string;
}

interface SubmissionData {
  id: string;
  assignmentId: string;
  studentName: string;
  studentId: string;
  content: string;
  submittedAt: string;
}

interface AssignmentData {
  id: string;
  title: string;
  schoolName: string;
  gradeLevel: string;
  writingType: string;
  evaluationDomains: string[];
  evaluationLevels: string[];
  levelCount: string;
}

export default function StudentReportPage({ params }: { params: { evaluationId: string } }) {
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.evaluationId]);

  // 드롭다운 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const fetchData = async () => {
    try {
      // 평가 데이터 가져오기
      const evalResponse = await fetch(`/api/evaluations/${params.evaluationId}`);
      const evalData = await evalResponse.json();
      
      if (evalData.success) {
        setEvaluation(evalData.evaluation);
        
        // 제출물 데이터 가져오기
        const subResponse = await fetch(`/api/submissions/${evalData.evaluation.submissionId}`);
        const subData = await subResponse.json();
        
        if (subData.success) {
          setSubmission(subData.submission);
          
          // 과제 데이터 가져오기
          const assignResponse = await fetch(`/api/assignments/${subData.submission.assignmentId}`);
          const assignData = await assignResponse.json();
          
          if (assignData.success) {
            setAssignment(assignData.assignment);
          }
        }
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelIndex = (level: string) => {
    if (!assignment) return 0;
    const index = assignment.evaluationLevels.indexOf(level);
    return index === -1 ? 0 : index;
  };

  const getLevelColor = (level: string) => {
    if (level.includes('매우 우수')) return 'text-green-600';
    if (level.includes('우수')) return 'text-blue-600';
    if (level.includes('보통')) return 'text-yellow-600';
    if (level.includes('미흡')) return 'text-red-600';
    return 'text-gray-600';
  };

  const handlePrint = () => {
    window.print();
  };

  // 내보내기 핸들러
  const handleExport = async (format: 'pdf' | 'json' | 'markdown') => {
    if (!evaluation || !submission || !assignment) return;

    try {
      switch (format) {
        case 'pdf':
          await handleExportPDF();
          break;
        case 'json':
          await handleExportJSON();
          break;
        case 'markdown':
          await handleExportMarkdown();
          break;
      }
      setShowExportMenu(false);
    } catch (error) {
      console.error(`${format} 내보내기 오류:`, error);
      alert(`${format.toUpperCase()} 생성 중 오류가 발생했습니다.`);
    }
  };

  // 서버 측 고품질 PDF 생성
  const handleExportPDF = async () => {
    if (!evaluation) return;

    const loadingMessage = document.createElement('div');
    loadingMessage.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 9999;">고품질 PDF 생성 중...</div>';
    document.body.appendChild(loadingMessage);

    try {
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationId: params.evaluationId }),
      });

      if (!response.ok) {
        throw new Error('PDF 생성 실패');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${evaluation.studentName}_평가보고서_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      document.body.removeChild(loadingMessage);
    } catch (error) {
      document.body.removeChild(loadingMessage);
      throw error;
    }
  };

  // JSON 내보내기
  const handleExportJSON = async () => {
    if (!evaluation || !submission || !assignment) return;

    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      assignment: {
        id: assignment.id,
        title: assignment.title,
        schoolName: assignment.schoolName,
        gradeLevel: assignment.gradeLevel,
        writingType: assignment.writingType,
        evaluationDomains: assignment.evaluationDomains,
        evaluationLevels: assignment.evaluationLevels,
      },
      student: {
        name: submission.studentName,
        studentId: submission.studentId,
        submittedAt: submission.submittedAt,
      },
      submission: {
        content: submission.content,
      },
      evaluation: {
        id: evaluation.id,
        evaluatedAt: evaluation.evaluatedAt,
        overallLevel: evaluation.overallLevel,
        overallFeedback: evaluation.overallFeedback,
        domainEvaluations: evaluation.domainEvaluations,
        improvementSuggestions: evaluation.improvementSuggestions,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${evaluation.studentName}_평가보고서_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Markdown 내보내기
  const handleExportMarkdown = async () => {
    if (!evaluation || !submission || !assignment) return;

    let markdown = `# 학생 평가 리포트\n\n`;

    markdown += `## 📋 과제 정보\n\n`;
    markdown += `- **과제명**: ${assignment.title}\n`;
    markdown += `- **학교**: ${assignment.schoolName}\n`;
    markdown += `- **학년**: ${assignment.gradeLevel}\n`;
    markdown += `- **글 종류**: ${assignment.writingType}\n\n`;

    markdown += `## 👤 학생 정보\n\n`;
    markdown += `- **이름**: ${submission.studentName}\n`;
    markdown += `- **학번**: ${submission.studentId}\n`;
    markdown += `- **제출일**: ${new Date(submission.submittedAt).toLocaleDateString('ko-KR')}\n\n`;

    markdown += `## 🎯 종합 평가\n\n`;
    markdown += `**성취 수준**: ${evaluation.overallLevel}\n\n`;
    markdown += `### 종합 피드백\n\n`;
    markdown += `${evaluation.overallFeedback}\n\n`;

    markdown += `## 📊 영역별 평가\n\n`;
    assignment.evaluationDomains.forEach((domain) => {
      const evalData = evaluation.domainEvaluations[domain];
      if (evalData) {
        markdown += `### ${domain}\n\n`;
        markdown += `- **수준**: ${evalData.level}\n`;
        markdown += `- **피드백**: ${evalData.feedback}\n\n`;
      }
    });

    if (evaluation.improvementSuggestions) {
      markdown += `## 💡 개선 방안\n\n`;
      const suggestions = typeof evaluation.improvementSuggestions === 'string'
        ? [evaluation.improvementSuggestions]
        : evaluation.improvementSuggestions;

      if (Array.isArray(suggestions)) {
        suggestions.forEach((suggestion, index) => {
          markdown += `${index + 1}. ${suggestion}\n`;
        });
      }
      markdown += `\n`;
    }

    markdown += `## 📝 제출한 글\n\n`;
    markdown += `\`\`\`\n${submission.content}\n\`\`\`\n\n`;

    markdown += `---\n\n`;
    markdown += `*평가일: ${new Date(evaluation.evaluatedAt).toLocaleDateString('ko-KR')}*  \n`;
    markdown += `*BlueNote AI 평가 시스템*\n`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${evaluation.studentName}_평가보고서_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!evaluation || !submission || !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">평가 결과를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 print:bg-white">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Navigation - 인쇄시 숨김 */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center print:mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">학생 평가 리포트</h1>
          <p className="text-lg text-slate-600">{assignment.title}</p>
        </div>

        {/* Student Info */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border border-slate-200/50 print:border-gray-300 print:shadow-none">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">학생 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">이름</p>
                <p className="font-medium text-slate-900">{submission.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">학번</p>
                <p className="font-medium text-slate-900">{submission.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">학교</p>
                <p className="font-medium text-slate-900">{assignment.schoolName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">학년</p>
                <p className="font-medium text-slate-900">{assignment.gradeLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Evaluation */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border border-slate-200/50 print:border-gray-300 print:shadow-none">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5" />
              종합 평가
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <GrowthStageIndicator 
                currentStage={getLevelIndex(evaluation.overallLevel)}
                totalStages={assignment.evaluationLevels.length}
                stageLabels={assignment.evaluationLevels}
              />
            </div>
            <div className={`text-center mb-4 ${getLevelColor(evaluation.overallLevel)}`}>
              <p className="text-2xl font-bold">{evaluation.overallLevel}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 leading-relaxed">{evaluation.overallFeedback}</p>
            </div>
          </CardContent>
        </Card>

        {/* Domain Evaluations */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border border-slate-200/50 print:border-gray-300 print:shadow-none">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              영역별 평가
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assignment.evaluationDomains.map((domain) => {
                const domainEval = evaluation.domainEvaluations[domain];
                if (!domainEval) return null;

                return (
                  <div key={domain} className="border-b border-slate-200 pb-6 last:border-0">
                    <div className="mb-3">
                      <h3 className="text-lg font-medium text-slate-800 mb-2">{domain}</h3>
                      <div className="mb-3">
                        <GrowthStageIndicator 
                          currentStage={getLevelIndex(domainEval.level)}
                          totalStages={assignment.evaluationLevels.length}
                          stageLabels={assignment.evaluationLevels}
                          compact
                        />
                      </div>
                      <p className={`font-medium ${getLevelColor(domainEval.level)}`}>
                        {domainEval.level}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-700 leading-relaxed">{domainEval.feedback}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Improvement Suggestions */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border border-slate-200/50 print:border-gray-300 print:shadow-none">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              향상 방안
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {evaluation.improvementSuggestions}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Student Writing */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border border-slate-200/50 print:border-gray-300 print:shadow-none print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              학생 글
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {submission.content}
              </p>
            </div>
            <div className="mt-3 text-sm text-slate-500">
              제출일: {new Date(submission.submittedAt).toLocaleString('ko-KR')}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - 인쇄시 숨김 */}
        <div className="flex justify-center gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-white/70 text-slate-700 rounded-lg hover:bg-white/80 transition-colors flex items-center gap-2 border border-slate-200/50"
          >
            <Printer className="w-5 h-5" />
            인쇄하기
          </button>

          <div className="relative export-menu-container">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-6 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 border border-blue-200/30"
            >
              <Download className="w-5 h-5" />
              내보내기
              <svg
                className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700"
                >
                  <FileText className="w-5 h-5" />
                  <span>PDF 저장</span>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700 border-t border-slate-100"
                >
                  <Code className="w-5 h-5" />
                  <span>JSON 저장</span>
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700 border-t border-slate-100"
                >
                  <FileText className="w-5 h-5" />
                  <span>Markdown 저장</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 20mm;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}