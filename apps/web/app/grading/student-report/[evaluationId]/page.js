'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Download,
  Printer,
  Star,
  TrendingUp,
  Award,
  Target,
  MessageSquare,
  User,
  Calendar,
  School
} from 'lucide-react';

export default function StudentReportPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = params.evaluationId;
  
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluation();
  }, [evaluationId]);

  const fetchEvaluation = async () => {
    try {
      // Mock data
      const mockEvaluation = {
        id: evaluationId,
        studentName: '김민준',
        studentNumber: '20240101',
        className: '6학년 1반',
        assignmentTitle: '2024 1학기 논설문 쓰기',
        schoolName: '서울초등학교',
        evaluatedAt: new Date().toISOString(),
        
        scores: {
          '주장의 명확성': 92,
          '근거의 타당성': 88,
          '논리적 구조': 90,
          '설득력 있는 표현': 85
        },
        overallScore: 89,
        level: '매우 우수',
        
        content: `우리 사회에서 인공지능의 역할이 점점 커지고 있습니다. 저는 인공지능이 우리 삶을 더 편리하게 만들어준다고 생각합니다.

첫째, 인공지능은 우리의 일상생활을 도와줍니다. 예를 들어, AI 스피커는 음악을 틀어주고 날씨를 알려줍니다. 또한 스마트폰의 AI 비서는 일정을 관리해주고 알람을 설정해줍니다.

둘째, 인공지능은 학습에도 도움을 줍니다. AI 튜터는 학생 개개인의 수준에 맞춰 문제를 내주고 설명해줍니다. 이렇게 하면 모든 학생이 자신의 속도에 맞춰 공부할 수 있습니다.

셋째, 의료 분야에서도 인공지능이 활용됩니다. AI는 의사가 병을 진단하는 것을 도와주고, 새로운 약을 개발하는 데에도 사용됩니다.`,
        
        feedback: {
          overall: '전반적으로 논리적인 구조를 갖추고 있으며, 주장이 명확하게 제시되었습니다. 인공지능의 장점을 구체적인 예시와 함께 설명한 점이 우수합니다.',
          strengths: [
            '주제에 대한 명확한 입장 제시',
            '다양한 분야의 구체적인 예시 활용',
            '논리적인 문단 구성',
            '일관된 주장 전개'
          ],
          improvements: [
            '반대 의견에 대한 고려와 반박 추가',
            '더 깊이 있는 근거 제시',
            '결론 부분의 강화'
          ]
        }
      };
      
      setEvaluation(mockEvaluation);
    } catch (error) {
      console.error('평가 결과 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    alert('PDF 내보내기 기능은 준비 중입니다.');
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrowthStage = (score) => {
    if (score >= 90) return { stage: 4, label: '열매', color: 'bg-green-500' };
    if (score >= 80) return { stage: 3, label: '꽃', color: 'bg-blue-500' };
    if (score >= 70) return { stage: 2, label: '새싹', color: 'bg-yellow-500' };
    return { stage: 1, label: '씨앗', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">평가 결과를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-slate-50 to-purple-50/20 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Hidden in print */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            뒤로 가기
          </button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800">개별 평가 리포트</h1>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                인쇄
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                PDF 다운로드
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-lg print:shadow-none">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-t-lg print:rounded-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <School className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">{evaluation.assignmentTitle}</h2>
                  <p className="text-blue-100">{evaluation.schoolName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">평가일</p>
                <p className="font-medium">{new Date(evaluation.evaluatedAt).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="p-8 border-b border-slate-200">
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <User className="w-10 h-10 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">학생 이름</p>
                  <p className="text-lg font-bold text-slate-800">{evaluation.studentName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">학번</p>
                <p className="text-lg font-medium text-slate-800">{evaluation.studentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">반</p>
                <p className="text-lg font-medium text-slate-800">{evaluation.className}</p>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-6">종합 평가 결과</h3>
              
              <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg mb-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">{evaluation.overallScore}</p>
                  <p className="text-sm text-slate-600">점</p>
                </div>
              </div>
              
              <div className="mb-4">
                <span className={`inline-flex px-6 py-3 rounded-full text-lg font-bold ${
                  evaluation.level === '매우 우수' ? 'bg-green-100 text-green-700' :
                  evaluation.level === '우수' ? 'bg-blue-100 text-blue-700' :
                  evaluation.level === '보통' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <Award className="w-6 h-6 mr-2" />
                  {evaluation.level}
                </span>
              </div>
              
              <p className="text-slate-600 max-w-2xl mx-auto">
                {evaluation.feedback.overall}
              </p>
            </div>
          </div>

          {/* Domain Scores */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6" />
              영역별 평가
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(evaluation.scores).map(([domain, score]) => {
                const growth = getGrowthStage(score);
                return (
                  <div key={domain} className="bg-slate-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-800">{domain}</h4>
                      <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {score}점
                      </span>
                    </div>
                    
                    {/* Growth Stage Indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4].map((stage) => (
                        <div
                          key={stage}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all ${
                            stage <= growth.stage ? growth.color : 'bg-slate-300'
                          }`}
                        >
                          {stage}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">성장 단계: {growth.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          <div className="p-8 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              상세 피드백
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  잘한 점
                </h4>
                <ul className="space-y-2">
                  {evaluation.feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-700">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  개선할 점
                </h4>
                <ul className="space-y-2">
                  {evaluation.feedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-700">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-100 rounded-b-lg text-center text-sm text-slate-600">
            <p>이 리포트는 AI 기반 자동 평가 시스템에 의해 생성되었습니다.</p>
            <p>최종 평가는 담당 교사의 검토를 거쳐 확정됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}