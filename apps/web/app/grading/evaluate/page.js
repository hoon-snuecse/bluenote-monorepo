'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Brain, 
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2,
  BarChart3
} from 'lucide-react';

export default function EvaluatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = searchParams.get('assignmentId');
  const submissionIds = searchParams.get('submissions')?.split(',') || [];
  
  const [evaluating, setEvaluating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch assignment info
      const assignmentRes = await fetch('/api/grading/assignments');
      const assignmentData = await assignmentRes.json();
      const currentAssignment = assignmentData.assignments?.find(a => a.id === assignmentId);
      setAssignment(currentAssignment);

      // Fetch submissions
      const submissionsRes = await fetch(`/api/grading/submissions?assignmentId=${assignmentId}`);
      const submissionsData = await submissionsRes.json();
      
      if (submissionsData.success) {
        const selectedSubmissions = submissionsData.submissions.filter(
          s => submissionIds.length === 0 || submissionIds.includes(s.id)
        );
        setSubmissions(selectedSubmissions);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    }
  };

  const startEvaluation = async () => {
    setEvaluating(true);
    setCurrentIndex(0);
    setEvaluationResults([]);

    // Simulate AI evaluation process
    for (let i = 0; i < submissions.length; i++) {
      setCurrentIndex(i);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock evaluation result
      const result = {
        submissionId: submissions[i].id,
        studentName: submissions[i].studentName,
        scores: {
          clarity: Math.floor(Math.random() * 20) + 80,
          evidence: Math.floor(Math.random() * 20) + 80,
          structure: Math.floor(Math.random() * 20) + 80,
          expression: Math.floor(Math.random() * 20) + 80
        },
        overallScore: Math.floor(Math.random() * 15) + 85,
        level: ['매우 우수', '우수', '보통'][Math.floor(Math.random() * 3)],
        feedback: '학생의 글은 전반적으로 잘 구성되어 있습니다. 주장이 명확하고 근거가 타당합니다.'
      };
      
      setEvaluationResults(prev => [...prev, result]);
    }
    
    setEvaluating(false);
  };

  const viewResults = () => {
    router.push(`/grading/dashboard/${assignmentId}`);
  };

  const progress = submissions.length > 0 
    ? Math.round((evaluationResults.length / submissions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-slate-50 to-purple-50/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            AI 평가 실행
          </h1>
          {assignment && (
            <p className="text-lg text-slate-600">
              {assignment.title}
            </p>
          )}
        </div>

        {/* Main Content */}
        {!evaluating && evaluationResults.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                평가 준비 완료
              </h2>
              <p className="text-slate-600 mb-2">
                총 <span className="font-bold text-blue-600">{submissions.length}개</span>의 제출물을 평가합니다.
              </p>
              <p className="text-sm text-slate-500 mb-8">
                평가에는 제출물당 약 2-3초가 소요됩니다.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-3">평가 항목</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                  {assignment?.evaluationDomains.map((domain, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{domain}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={startEvaluation}
                className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-lg font-medium flex items-center gap-2 mx-auto"
              >
                <Brain className="w-5 h-5" />
                평가 시작하기
              </button>
            </div>
          </div>
        )}

        {/* Evaluating Progress */}
        {evaluating && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                AI 평가 진행 중...
              </h2>
              <p className="text-slate-600">
                {currentIndex + 1} / {submissions.length} 평가 중
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>진행률</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            {/* Current Student */}
            {submissions[currentIndex] && (
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-600">현재 평가 중:</p>
                <p className="font-medium text-slate-800">
                  {submissions[currentIndex].studentName} ({submissions[currentIndex].className})
                </p>
              </div>
            )}
          </div>
        )}

        {/* Evaluation Complete */}
        {!evaluating && evaluationResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                평가 완료!
              </h2>
              <p className="text-slate-600">
                총 {evaluationResults.length}개의 제출물 평가를 완료했습니다.
              </p>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-600 mb-1">평균 점수</p>
                <p className="text-2xl font-bold text-blue-800">
                  {Math.round(evaluationResults.reduce((acc, r) => acc + r.overallScore, 0) / evaluationResults.length)}점
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-green-600 mb-1">매우 우수</p>
                <p className="text-2xl font-bold text-green-800">
                  {evaluationResults.filter(r => r.level === '매우 우수').length}명
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-sm text-purple-600 mb-1">처리 시간</p>
                <p className="text-2xl font-bold text-purple-800">
                  {Math.round(evaluationResults.length * 2)}초
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={viewResults}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                평가 결과 보기
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">AI 평가 안내</p>
              <p>AI 평가는 참고용으로 제공되며, 최종 평가는 교사의 검토가 필요합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}