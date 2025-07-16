'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Play, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface EvaluationTask {
  id: string;
  studentName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
}

export default function EvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationTasks, setEvaluationTasks] = useState<EvaluationTask[]>([]);
  const [selectedModel, setSelectedModel] = useState('claude-opus-4-20250514');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.assignmentId, searchParams]);

  const fetchData = async () => {
    try {
      // Get submission IDs from query params
      const submissionIds = searchParams.get('submissions')?.split(',') || [];
      
      // Fetch assignment details
      const assignmentRes = await fetch(`/api/assignments/${params.assignmentId}`);
      const assignmentData = await assignmentRes.json();
      if (assignmentData.success) {
        setAssignment(assignmentData.assignment);
      }
      
      // Fetch specific submissions or all submissions
      if (submissionIds.length > 0) {
        const submissionsRes = await fetch(`/api/assignments/${params.assignmentId}/submissions`);
        const submissionsData = await submissionsRes.json();
        if (submissionsData.success) {
          const filteredSubmissions = submissionsData.submissions
            .filter((sub: any) => submissionIds.includes(sub.id) && sub.status === 'submitted')
            .map((sub: any) => ({
              id: sub.id,
              studentId: sub.studentId,
              studentName: sub.studentName,
              content: sub.content
            }));
          setSubmissions(filteredSubmissions);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvaluation = async () => {
    setIsEvaluating(true);
    
    // 초기 태스크 생성
    const tasks: EvaluationTask[] = submissions.map(submission => ({
      id: submission.id,
      studentName: submission.studentName,
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

      // AI 평가 API 호출
      try {
        const response = await fetch('/api/evaluate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submissionId: tasks[i].id,
            assignmentId: params.assignmentId,
            model: selectedModel
          }),
        });

        if (!response.ok) {
          throw new Error('Evaluation failed');
        }

        const result = await response.json();
        console.log('Evaluation result:', result);
        
        if (!result.success) {
          throw new Error(result.details || result.error || 'Evaluation failed');
        }
      } catch (error) {
        console.error('Evaluation error:', error);
        // Mark as failed
        setEvaluationTasks(prev => 
          prev.map((task, index) => 
            index === i 
              ? { 
                  ...task, 
                  status: 'failed',
                  message: error instanceof Error ? error.message : '평가 중 오류가 발생했습니다.'
                } 
              : task
          )
        );
        continue;
      }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-slate-600">{assignment?.title || '과제 제목'}</p>
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
                    <option value="claude-opus-4-20250514">Claude Opus 4 (가장 강력한 모델)</option>
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (권장 - 스마트하고 효율적)</option>
                    <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-haiku">Claude 3 Haiku (빠른 속도)</option>
                    <option value="gpt-4o">GPT-4o (최신)</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>

                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-base text-slate-700">
                        총 <strong>{submissions.length}명</strong>의 학생이 글쓰기를 제출했습니다.
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
                    <div className="text-right">
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
                      {task.status === 'failed' && task.message && (
                        <p className="text-xs text-red-500 mt-1">{task.message}</p>
                      )}
                    </div>
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
              onClick={() => router.push(`/assignments/${params.assignmentId}/dashboard`)}
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