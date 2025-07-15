'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Play, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { mockStudents } from '@/lib/mock-data';

interface EvaluationTask {
  id: string;
  studentName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export default function EvaluatePage() {
  const _params = useParams();
  const router = useRouter();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationTasks, setEvaluationTasks] = useState<EvaluationTask[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  // 제출한 학생들만 필터링 (실제로는 API에서 가져와야 함)
  const submittedStudents = mockStudents.slice(0, 7);

  const handleStartEvaluation = async () => {
    setIsEvaluating(true);
    
    // 초기 태스크 생성
    const tasks: EvaluationTask[] = submittedStudents.map(student => ({
      id: student.id,
      studentName: student.name,
      status: 'pending',
    }));
    setEvaluationTasks(tasks);

    // 순차적으로 평가 실행 (시뮬레이션)
    for (let i = 0; i < tasks.length; i++) {
      // 현재 태스크를 processing으로 업데이트
      setEvaluationTasks(prev => 
        prev.map((task, index) => 
          index === i ? { ...task, status: 'processing' } : task
        )
      );

      // AI 평가 시뮬레이션 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 완료 상태로 업데이트
      setEvaluationTasks(prev => 
        prev.map((task, index) => 
          index === i 
            ? { 
                ...task, 
                status: 'completed',
                message: '평가가 성공적으로 완료되었습니다.'
              } 
            : task
        )
      );
    }

    setIsEvaluating(false);
  };

  const completedCount = evaluationTasks.filter(t => t.status === 'completed').length;
  const totalCount = evaluationTasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/assignments')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            과제 목록으로 돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI 평가 실행</h1>
          <p className="text-slate-600">설득하는 글쓰기 - 환경 보호의 중요성</p>
        </div>

        {/* Settings Card */}
        {!isEvaluating && evaluationTasks.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 mb-8">
            <CardHeader>
              <CardTitle className="text-xl">평가 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    AI 모델 선택
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                  >
                    <option value="gpt-4">GPT-4 (권장)</option>
                    <option value="gpt-3.5">GPT-3.5 Turbo</option>
                    <option value="claude">Claude 3</option>
                  </select>
                </div>

                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-base text-slate-700">
                        총 <strong>{submittedStudents.length}명</strong>의 학생이 글쓰기를 제출했습니다.
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        평가는 학생당 약 30초~1분 정도 소요됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Card */}
        {(isEvaluating || evaluationTasks.length > 0) && (
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 mb-8">
            <CardHeader>
              <CardTitle className="text-xl">평가 진행 상황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base text-slate-700">진행률</span>
                  <span className="text-base font-medium text-slate-800">
                    {completedCount} / {totalCount}
                  </span>
                </div>
                <div className="w-full bg-slate-200/50 rounded-full h-3">
                  <div 
                    className="bg-blue-500/60 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {evaluationTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {task.status === 'pending' && (
                        <FileText className="w-5 h-5 text-slate-400" />
                      )}
                      {task.status === 'processing' && (
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      )}
                      {task.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {task.status === 'failed' && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-base text-slate-700">{task.studentName}</span>
                    </div>
                    <span className={`text-sm ${
                      task.status === 'completed' ? 'text-green-600' :
                      task.status === 'processing' ? 'text-blue-600' :
                      task.status === 'failed' ? 'text-red-600' :
                      'text-slate-500'
                    }`}>
                      {task.status === 'pending' ? '대기 중' :
                       task.status === 'processing' ? '평가 중...' :
                       task.status === 'completed' ? '완료' :
                       '실패'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {!isEvaluating && evaluationTasks.length === 0 && (
            <button
              onClick={handleStartEvaluation}
              className="px-8 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 border border-blue-200/30 text-lg font-medium"
            >
              <Play className="w-5 h-5" />
              평가 시작
            </button>
          )}

          {evaluationTasks.length > 0 && completedCount === totalCount && (
            <button
              onClick={() => router.push('/grading')}
              className="px-8 py-3 bg-green-500/20 text-slate-700 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 border border-green-200/30 text-lg font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              평가 결과 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}