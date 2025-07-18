'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GrowthStageIndicator } from '@/components/GrowthStageIndicator';
import { Download, Printer, BookOpen, Target, MessageSquare, TrendingUp, Calendar, Clock, Award } from 'lucide-react';
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

interface TokenData {
  token: string;
  evaluationId: string;
  studentId: string;
  expiresAt: string;
}

export default function StudentViewPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [previousEvaluations, setPreviousEvaluations] = useState<EvaluationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateAndFetchData();
  }, [params.token]);

  const validateAndFetchData = async () => {
    try {
      // 토큰 검증
      const tokenResponse = await fetch(`/api/access-tokens?token=${params.token}`);
      const tokenResult = await tokenResponse.json();
      
      if (!tokenResult.success) {
        setError(tokenResult.error);
        setLoading(false);
        return;
      }
      
      setTokenData(tokenResult.tokenData);
      
      // 평가 데이터 가져오기
      const evalResponse = await fetch(`/api/evaluations/${tokenResult.tokenData.evaluationId}`);
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
            
            // 이전 평가 기록 가져오기
            await fetchPreviousEvaluations(tokenResult.tokenData.studentId, subData.submission.assignmentId);
          }
        }
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousEvaluations = async (studentId: string, currentAssignmentId: string) => {
    try {
      const response = await fetch(`/api/evaluations/by-student/${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        // 현재 과제를 제외한 이전 평가들만 필터링
        const previous = data.evaluations.filter(
          (e: EvaluationData) => e.id !== evaluation?.id
        );
        setPreviousEvaluations(previous);
      }
    } catch (error) {
      console.error('이전 평가 조회 오류:', error);
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

  const handleExportPDF = async () => {
    // 기존 PDF 내보내기 로직 재사용
    try {
      const loadingMessage = document.createElement('div');
      loadingMessage.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 9999;">PDF 생성 중...</div>';
      document.body.appendChild(loadingMessage);

      const printElements = document.querySelectorAll('.print\\:hidden');
      printElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });

      const element = document.querySelector('.container') as HTMLElement;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      const fileName = `${evaluation?.studentName}_${assignment?.title}_평가리포트_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      printElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });

      document.body.removeChild(loadingMessage);
    } catch (error) {
      console.error('PDF 내보내기 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">평가 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="py-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </CardContent>
        </Card>
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
        {/* Header */}
        <div className="mb-8 text-center print:mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">평가 결과</h1>
          <p className="text-lg text-slate-600">{assignment.title}</p>
          <p className="text-sm text-slate-500 mt-2">
            {submission.studentName} ({submission.studentId})
          </p>
        </div>

        {/* 접근 정보 - 인쇄시 숨김 */}
        <Card className="mb-8 bg-blue-50/50 border border-blue-200/50 print:hidden">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Clock className="w-4 h-4" />
              <span>이 링크는 {new Date(tokenData!.expiresAt).toLocaleDateString('ko-KR')}까지 유효합니다.</span>
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

        {/* Growth History - 인쇄시 숨김 */}
        {previousEvaluations.length > 0 && (
          <Card className="mb-8 bg-white/70 backdrop-blur-sm border border-slate-200/50 print:hidden">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5" />
                성장 이력
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previousEvaluations.map((prevEval) => (
                  <div key={prevEval.id} className="border-l-4 border-blue-300 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-800">이전 평가</p>
                      <p className="text-sm text-slate-500">
                        {new Date(prevEval.evaluatedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <p className={`font-medium ${getLevelColor(prevEval.overallLevel)}`}>
                      종합 평가: {prevEval.overallLevel}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Writing */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border border-slate-200/50 print:border-gray-300 print:shadow-none print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              제출한 글
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
          <button
            onClick={handleExportPDF}
            className="px-6 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 border border-blue-200/30"
          >
            <Download className="w-5 h-5" />
            PDF 내보내기
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>평가일: {new Date(evaluation.evaluatedAt).toLocaleDateString('ko-KR')}</p>
          <p className="mt-1">{assignment.schoolName} · {assignment.gradeLevel}</p>
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