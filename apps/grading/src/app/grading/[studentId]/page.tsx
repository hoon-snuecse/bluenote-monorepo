'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mockEvaluationResults } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GrowthStageIndicator } from '@/components/GrowthStageIndicator';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { exportToPDF } from '@/lib/export-utils';
import type { EvaluationResult } from '@/types/grading';

export default function StudentReport() {
  const params = useParams();
  const router = useRouter();
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 평가 데이터를 객체 형태로 변환
  const getEvaluationData = (domainEvaluations: EvaluationResult['domainEvaluations']) => {
    return {
      '주장의 명확성': { level: domainEvaluations.clarity.level },
      '근거의 타당성': { level: domainEvaluations.validity.level },
      '논리적 구조': { level: domainEvaluations.structure.level },
      '설듕력 있는 표현': { level: domainEvaluations.expression.level }
    };
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '매우 우수': return 'bg-blue-500/40';
      case '우수': return 'bg-blue-400/40';
      case '보통': return 'bg-amber-400/40';
      case '미흡': return 'bg-slate-400/40';
      default: return 'bg-slate-300/40';
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case '매우 우수': return 'bg-blue-100/50 text-blue-800 border-blue-200/30';
      case '우수': return 'bg-blue-50/50 text-blue-700 border-blue-200/30';
      case '보통': return 'bg-amber-50/50 text-amber-700 border-amber-200/30';
      case '미흡': return 'bg-slate-50/50 text-slate-700 border-slate-200/30';
      default: return 'bg-slate-50/50 text-slate-700 border-slate-200/30';
    }
  };

  useEffect(() => {
    const studentId = params.studentId as string;
    const result = mockEvaluationResults.find(
      (result) => result.student.id === studentId
    );
    setEvaluationResult(result || null);
    setIsLoading(false);
  }, [params.studentId]);

  const handlePDFExport = async () => {
    if (evaluationResult) {
      await exportToPDF(evaluationResult);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <p className="text-center text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!evaluationResult) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <p className="text-center text-gray-500">평가 결과를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { student, assignmentTitle, overallLevel, holisticFeedback, domainEvaluations } = evaluationResult;

  const evaluationData = evaluationResult ? getEvaluationData(evaluationResult.domainEvaluations) : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Navigation and Actions */}
        <div className="mb-8 flex items-center justify-between no-print">
          <button
            onClick={() => router.push('/grading')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-base"
          >
            <ArrowLeft className="w-5 h-5" />
            대시보드로 돌아가기
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePDFExport}
              className="px-4 py-2 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 border border-blue-200/30"
            >
              <Download className="w-4 h-4" />
              PDF 저장
            </button>
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-500/20 text-slate-700 rounded-lg hover:bg-slate-500/30 transition-colors flex items-center gap-2 border border-slate-200/30"
            >
              <Printer className="w-4 h-4" />
              인쇄
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{student.name} 학생 평가 보고서</h1>
          <p className="text-slate-600 text-lg">{student.class}반 | 학번: {student.studentNumber}</p>
        </div>

        {/* Assignment Info */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-lg border border-slate-200/50">
          <CardHeader className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-t-xl">
            <CardTitle className="text-xl text-center text-slate-800">과제 정보</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-slate-700 text-center text-lg">{assignmentTitle}</p>
          </CardContent>
        </Card>

        {/* Overall Evaluation with Chart */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-lg border border-slate-200/50">
          <CardHeader className="bg-gradient-to-r from-slate-600/20 to-slate-700/20 rounded-t-xl">
            <CardTitle className="text-xl text-center text-slate-800">종합 평가</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <GrowthStageIndicator level={overallLevel} className="mb-4" />
              </div>
              <p className="text-slate-700 leading-relaxed mb-6 text-lg">{holisticFeedback}</p>

              {/* 영역별 평가 그래프 */}
              <div className="bg-slate-50/50 rounded-lg p-6 border border-slate-200/30">
                <h3 className="text-center font-medium text-slate-900 mb-6 text-lg">영역별 성취 수준</h3>
                <div className="space-y-4">
                  {Object.entries(evaluationData).map(([domain, data]) => {
                    const typedData = data as {level: string};
                    return (
                      <div key={domain}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-base font-medium text-slate-700">{domain}</span>
                          <span className={`text-sm px-3 py-1 rounded-full border ${getLevelBgColor(typedData.level)}`}>
                            {typedData.level}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {['미흡', '보통', '우수', '매우 우수'].map((stage) => {
                            const levels = ['미흡', '보통', '우수', '매우 우수'];
                            const currentLevelIndex = levels.indexOf(typedData.level);
                            const stageIndex = levels.indexOf(stage);
                            const isActive = stageIndex <= currentLevelIndex;
                            
                            return (
                              <div
                                key={stage}
                                className={`flex-1 h-8 rounded ${isActive ? getLevelColor(typedData.level) : 'bg-slate-200/30'} 
                                  flex items-center justify-center text-sm font-medium transition-all duration-500`}
                              >
                                <span className={isActive ? 'text-slate-700' : 'text-slate-400'}>
                                  {stage}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domain Evaluations - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(domainEvaluations).map(([key, evaluation]) => (
            <Card key={key} className="animate-fade-in-up bg-white/70 backdrop-blur-sm shadow-lg border border-slate-200/50">
              <CardHeader className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-t-xl">
                <CardTitle className="text-xl text-center text-slate-800">{evaluation.domain}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4 text-center">
                  <span className={`inline-block px-4 py-2 rounded-full text-base font-medium border ${getLevelBgColor(evaluation.level)}`}>
                    {evaluation.level}
                  </span>
                </div>
                <p className="text-slate-700 mb-4 text-lg">{evaluation.feedback}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Growth Example - Single Integrated Section */}
        {Object.entries(domainEvaluations).find(([_, evaluation]) => evaluation.level === '보통' || evaluation.level === '미흡') && (
          <Card className="mt-8 bg-white/70 backdrop-blur-sm shadow-lg border border-slate-200/50">
            <CardHeader className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-t-xl">
              <CardTitle className="text-xl text-center text-slate-800">성장을 위한 글쓰기 예시</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {(() => {
                const lowestDomain = Object.entries(domainEvaluations).find(
                  ([_, evaluation]) => evaluation.level === '미흡'
                ) || Object.entries(domainEvaluations).find(
                  ([_, evaluation]) => evaluation.level === '보통'
                );
                
                if (!lowestDomain) return null;
                const [_, evaluation] = lowestDomain;
                
                return (
                  <>
                    <p className="text-center text-slate-700 mb-6 text-lg">
                      {evaluation.domain} 영역에서 더 나은 성취를 위한 구체적인 개선 방안입니다.
                    </p>
                    {evaluation.growthExample && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-amber-50/50 p-6 rounded-lg border border-amber-200/30">
                          <h4 className="font-medium text-amber-900 mb-3 text-center text-lg">개선 전</h4>
                          <p className="text-slate-700 leading-relaxed text-base">
                            {evaluation.growthExample.before}
                          </p>
                          <div className="mt-4 text-base text-amber-700 bg-amber-100/50 p-3 rounded">
                            <strong>문제점:</strong> {evaluation.level === '보통' ? '다양성과 설득력 부족' : '기본적인 요소 미흡'}
                          </div>
                        </div>
                        
                        <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-200/30">
                          <h4 className="font-medium text-blue-900 mb-3 text-center text-lg">개선 후</h4>
                          <p className="text-slate-700 leading-relaxed text-base">
                            {evaluation.growthExample.after}
                          </p>
                          <div className="mt-4 text-base text-blue-700 bg-blue-100/50 p-3 rounded">
                            <strong>개선점:</strong> 구체적이고 설득력 있는 표현 사용
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Teacher Comments Section */}
        <Card className="mt-8 bg-white/70 backdrop-blur-sm shadow-lg border border-slate-200/50 no-print">
          <CardHeader className="bg-gradient-to-r from-slate-500/20 to-slate-600/20 rounded-t-xl">
            <CardTitle className="text-xl text-center text-slate-800">선생님 코멘트</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <textarea
              className="w-full p-4 border border-slate-200/30 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/50 text-xl"
              rows={4}
              placeholder="학생에게 전달할 추가 피드백을 작성해주세요..."
              defaultValue={evaluationResult.teacherComments}
            />
            <button className="mt-3 px-4 py-2 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-200/30">
              코멘트 저장
            </button>
          </CardContent>
        </Card>

        {/* Closing Message */}
        <Card className="mt-8 bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-500/20 shadow-lg border border-slate-200/50">
          <CardContent className="pt-6 pb-6">
            <p className="text-center text-slate-800 italic text-xl leading-relaxed">
              "꾸준한 노력으로 성장하는 모습이 인상적입니다. 
              앞으로도 독서를 통해 어휘력을 늘리고, 다양한 글쓰기 연습을 지속한다면 
              더욱 훌륭한 글을 쓸 수 있을 것입니다. 화이팅!"
            </p>
            <p className="text-center text-slate-600 mt-3 text-lg">- 담임 선생님 -</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}