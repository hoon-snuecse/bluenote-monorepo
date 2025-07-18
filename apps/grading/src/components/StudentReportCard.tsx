'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { GrowthStageIndicator } from '@/components/GrowthStageIndicator';
import type { EvaluationResult, DomainKey } from '@/types/grading';

interface StudentReportCardProps {
  evaluation: EvaluationResult;
}

// Memoize the component to prevent unnecessary re-renders
export const StudentReportCard = memo(function StudentReportCard({ evaluation }: StudentReportCardProps) {
  const domainOrder: DomainKey[] = ['clarity', 'validity', 'logic', 'expression'];
  const domainLabels: Record<DomainKey, string> = {
    clarity: '주장의 명확성',
    validity: '근거의 타당성',
    logic: '논리적 구조',
    expression: '설득력 있는 표현'
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">
          {evaluation.student.name} ({evaluation.student.studentNumber})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Domain Evaluations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domainOrder.map((domain) => {
              const domainEval = evaluation.domainEvaluations[domain];
              return (
                <div key={domain} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {domainLabels[domain]}
                  </h4>
                  <GrowthStageIndicator 
                    level={domainEval.level} 
                    score={domainEval.score}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {domainEval.feedback}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Overall Evaluation */}
          <div className="bg-blue-50/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">종합 평가</h4>
            <div className="flex items-center gap-4 mb-3">
              <span className={`text-lg font-bold ${
                evaluation.overallLevel === '매우 우수' ? 'text-blue-600' :
                evaluation.overallLevel === '우수' ? 'text-green-600' :
                evaluation.overallLevel === '보통' ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                {evaluation.overallLevel}
              </span>
              <span className="text-gray-600">
                (종합 점수: {evaluation.overallScore}점)
              </span>
            </div>
            <p className="text-gray-700">{evaluation.feedback}</p>
          </div>

          {/* Strengths and Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50/50 rounded-lg p-4">
              <h4 className="font-medium text-green-700 mb-2">잘한 점</h4>
              <ul className="list-disc list-inside space-y-1">
                {evaluation.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50/50 rounded-lg p-4">
              <h4 className="font-medium text-orange-700 mb-2">개선할 점</h4>
              <ul className="list-disc list-inside space-y-1">
                {evaluation.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-gray-700">{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});