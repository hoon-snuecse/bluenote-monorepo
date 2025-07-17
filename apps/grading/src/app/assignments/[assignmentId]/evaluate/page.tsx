'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Play, Loader2, CheckCircle, AlertCircle, FileText, Eye, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-20250514');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showStudentPreview, setShowStudentPreview] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [evaluationPrompt, setEvaluationPrompt] = useState('');

  useEffect(() => {
    fetchData();
  }, [params.assignmentId, searchParams]);
  
  // assignment나 submissions가 변경될 때마다 프롬프트 미리보기 업데이트
  useEffect(() => {
    if (assignment && submissions.length > 0) {
      const prompt = generateEvaluationPromptPreview(assignment, submissions);
      setEvaluationPrompt(prompt);
    }
  }, [assignment, submissions]);

  const fetchData = async () => {
    try {
      // Get submission IDs from query params
      const submissionIds = searchParams.get('submissions')?.split(',') || [];
      console.log('Evaluate page - submissionIds:', submissionIds);
      
      // Fetch assignment details
      const assignmentRes = await fetch(`/api/assignments/${params.assignmentId}`);
      const assignmentData = await assignmentRes.json();
      console.log('Assignment data:', assignmentData);
      if (assignmentData.success) {
        // JSON 필드가 배열인지 확인하고 변환
        const assignment = {
          ...assignmentData.assignment,
          evaluationDomains: Array.isArray(assignmentData.assignment.evaluationDomains) 
            ? assignmentData.assignment.evaluationDomains 
            : JSON.parse(assignmentData.assignment.evaluationDomains || '[]'),
          evaluationLevels: Array.isArray(assignmentData.assignment.evaluationLevels)
            ? assignmentData.assignment.evaluationLevels
            : JSON.parse(assignmentData.assignment.evaluationLevels || '[]')
        };
        console.log('Processed assignment with gradingCriteria:', {
          hasGradingCriteria: !!assignment.gradingCriteria,
          gradingCriteriaLength: assignment.gradingCriteria?.length || 0,
          gradingCriteriaPreview: assignment.gradingCriteria?.substring(0, 100) || 'NO CRITERIA'
        });
        setAssignment(assignment);
      }
      
      // Fetch specific submissions or all submissions
      const submissionsRes = await fetch(`/api/assignments/${params.assignmentId}/submissions`);
      const submissionsData = await submissionsRes.json();
      console.log('Submissions data:', submissionsData);
      if (submissionsData.success) {
        let filteredSubmissions;
        
        if (submissionIds.length > 0) {
          // 특정 submission IDs만 필터링
          filteredSubmissions = submissionsData.submissions
            .filter((sub: any) => submissionIds.includes(sub.id))
            .map((sub: any) => ({
              id: sub.id,
              studentId: sub.studentId,
              studentName: sub.studentName,
              content: sub.content,
              status: sub.status
            }));
        } else {
          // submission IDs가 없으면 모든 제출물 사용
          filteredSubmissions = submissionsData.submissions
            .filter((sub: any) => sub.content && sub.content.length > 0) // 내용이 있는 제출물만
            .map((sub: any) => ({
              id: sub.id,
              studentId: sub.studentId,
              studentName: sub.studentName,
              content: sub.content,
              status: sub.status
            }));
        }
        
        console.log('Filtered submissions:', filteredSubmissions);
        setSubmissions(filteredSubmissions);
        
        // 프롬프트는 useEffect에서 생성됨
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateEvaluationPromptPreview = (assignment: any, submissions: Submission[]) => {
    // 실제 Claude API에 전달되는 프롬프트 형식
    if (!assignment || !assignment.gradingCriteria) {
      console.error('평가 기준이 없습니다.', assignment);
    }
    
    const systemPrompt = `당신은 ${assignment?.schoolName || '한국초등학교'} ${assignment?.gradeLevel || '초등학교'} 담임교사입니다. 
학생의 ${assignment?.writingType || '논설문'}을 평가하고 있습니다.

[과제 정보]
- 과제 제목: ${assignment?.title || '과제 제목 없음'}
- 학교: ${assignment?.schoolName || '학교명 없음'}
- 학년: ${assignment?.gradeLevel || '학년 정보 없음'}  
- 글 유형: ${assignment?.writingType || '글 유형 없음'}

[평가 설정]
- 평가 영역: ${assignment?.evaluationDomains?.join(', ') || '평가 영역이 설정되지 않음'}
- 평가 수준: ${assignment?.evaluationLevels?.join(', ') || '평가 수준이 설정되지 않음'}
- 평가 수준 개수: ${assignment?.levelCount || 0}개

[평가 기준]
${assignment?.gradingCriteria || '평가 기준이 설정되지 않음'}

다음 형식으로 JSON 응답을 제공해주세요:
{
  "overallScore": 점수 (0-100),
  "overallGrade": "전체 평가 수준",
  "domainScores": { "영역명": 점수, ... },
  "domainGrades": { "영역명": "평가 수준", ... },
  "strengths": ["강점1", "강점2", ...],
  "improvements": ["개선점1", "개선점2", ...],
  "detailedFeedback": "상세 피드백 (학생과 학부모가 이해하기 쉽게)"
}`;

    let previewContent = `=== 시스템 프롬프트 (모든 학생 공통) ===\n${systemPrompt}\n\n`;
    
    previewContent += `=== 각 학생별 개별 평가 프롬프트 ===\n`;
    previewContent += `ℹ️ 실제 평가 시 각 학생마다 아래와 같은 형식으로 개별적으로 평가됩니다:\n\n`;
    
    for (let index = 0; index < submissions.length; index++) {
      const submission = submissions[index];
      const userPrompt = `학생 이름: ${submission.studentName}
과제 제목: ${assignment?.title || '글쓰기 과제'}

학생의 글:
${submission.content?.substring(0, 100)}...

위 글을 평가해주세요.`;
      
      previewContent += `[학생 ${index + 1}: ${submission.studentName}]\n${userPrompt}\n\n`;
      
      if (index === 2 && submissions.length > 3) {
        previewContent += `... 그리고 ${submissions.length - 3}명의 학생이 더 있습니다.\n\n`;
        break;
      }
    }
    
    previewContent += `⚠️ 주의: 실제 평가 시에는 각 학생의 글 전체 내용이 AI에게 전달됩니다.`;

    return previewContent;
  };

  const handleStartEvaluation = async () => {
    setIsEvaluating(true);
    
    // 평가 직전에 최신 제출물 데이터 다시 가져오기
    let updatedSubmissions = submissions;
    try {
      const submissionsRes = await fetch(`/api/assignments/${params.assignmentId}/submissions`);
      const submissionsData = await submissionsRes.json();
      if (submissionsData.success) {
        const submissionIds = searchParams.get('submissions')?.split(',') || [];
        updatedSubmissions = submissionsData.submissions
          .filter((sub: any) => submissionIds.includes(sub.id))
          .map((sub: any) => ({
            id: sub.id,
            studentId: sub.studentId,
            studentName: sub.studentName,
            content: sub.content,
            status: sub.status
          }));
        console.log('평가 직전 업데이트된 제출물:', updatedSubmissions);
      }
    } catch (error) {
      console.error('제출물 업데이트 오류:', error);
    }
    
    // 초기 태스크 생성
    const tasks: EvaluationTask[] = updatedSubmissions.map(submission => ({
      id: submission.id,
      studentName: submission.studentName,
      status: 'pending',
    }));
    setEvaluationTasks(tasks);

    // 순차적으로 평가 실행
    for (let i = 0; i < tasks.length; i++) {
      // 현재 태스크를 processing으로 업데이트
      setEvaluationTasks(prev => 
        prev.map((task, index) => 
          index === i ? { ...task, status: 'processing' } : task
        )
      );

      // AI 평가 API 호출
      try {
        // 업데이트된 제출물 데이터 사용
        const submission = updatedSubmissions[i];
        
        console.log(`평가 시작 - 학생: ${submission.studentName}`);
        console.log('제출물 내용 길이:', submission.content?.length || 0);
        console.log('제출물 내용 미리보기:', submission.content?.substring(0, 100) || 'NO CONTENT');
        console.log('=== Assignment 전체 데이터 ===');
        console.log('Title:', assignment?.title);
        console.log('School Name:', assignment?.schoolName);
        console.log('Grade Level:', assignment?.gradeLevel);
        console.log('Writing Type:', assignment?.writingType);
        console.log('Level Count:', assignment?.levelCount);
        console.log('평가 영역:', assignment?.evaluationDomains);
        console.log('평가 수준:', assignment?.evaluationLevels);
        console.log('채점 기준 존재 여부:', !!assignment?.gradingCriteria);
        console.log('채점 기준 길이:', assignment?.gradingCriteria?.length || 0);
        console.log('채점 기준 미리보기:', assignment?.gradingCriteria?.substring(0, 200));
        
        const requestData = {
          submissionId: tasks[i].id,
          assignmentId: params.assignmentId,
          content: submission.content,
          gradingCriteria: assignment?.gradingCriteria || '',
          evaluationDomains: assignment?.evaluationDomains || [],
          evaluationLevels: assignment?.evaluationLevels || [],
          levelCount: assignment?.levelCount || assignment?.evaluationLevels?.length || 4,
          title: assignment?.title || '',
          schoolName: assignment?.schoolName || '',
          gradeLevel: assignment?.gradeLevel || '',
          writingType: assignment?.writingType || '',
          aiModel: selectedModel,
          studentId: submission.studentId,
          studentName: submission.studentName
        };
        
        console.log('평가 요청 데이터:', requestData);
        
        const response = await fetch('/api/evaluations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Evaluation API error:', response.status, errorText);
          let errorMessage = `Evaluation failed: ${response.status}`;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorMessage;
            if (errorJson.details) {
              console.error('Error details:', errorJson.details);
            }
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          throw new Error(errorMessage);
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
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-lg text-slate-700 mb-2">평가할 제출물이 없습니다.</p>
                  <p className="text-sm text-slate-600 mb-4">평가하려는 제출물을 선택해주세요.</p>
                  <button
                    onClick={() => router.push(`/assignments/${params.assignmentId}/submissions`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    제출 현황으로 돌아가기
                  </button>
                </div>
              ) : (
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
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (권장 - 스마트하고 효율적)</option>
                    <option value="claude-opus-4-20250514">Claude Opus 4 (가장 강력한 모델)</option>
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
                
                {/* 학생 정보 미리보기 */}
                <div className="mt-6 border-t border-slate-200/50 pt-4">
                  <button
                    onClick={() => setShowStudentPreview(!showStudentPreview)}
                    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="font-medium">평가할 학생 목록 및 글 내용 미리보기</span>
                    {showStudentPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showStudentPreview && (
                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                      {submissions.map((sub, idx) => (
                        <div key={sub.id} className="p-3 bg-slate-50/50 rounded-lg border border-slate-200/30">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-slate-800">{idx + 1}. {sub.studentName}</span>
                            <span className="text-sm text-slate-600">학번: {sub.studentId}</span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {sub.content?.substring(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* AI 프롬프트 미리보기 */}
                <div className="mt-6 border-t border-slate-200/50 pt-4">
                  <button
                    onClick={() => setShowPromptPreview(!showPromptPreview)}
                    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="font-medium">AI 평가 프롬프트 미리보기</span>
                    {showPromptPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showPromptPreview && (
                    <div className="mt-4">
                      <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200/30">
                        <p className="text-sm text-slate-600 whitespace-pre-wrap font-mono">
                          {evaluationPrompt}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        * 시스템 프롬프트는 모든 학생에게 공통적으로 적용됩니다.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        * 각 학생의 글은 개별적으로 AI에게 전달되어 평가됩니다.
                      </p>
                      {!assignment?.gradingCriteria && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          ⚠️ 경고: 평가 기준(gradingCriteria)이 설정되지 않았습니다. 과제 설정을 확인해주세요.
                        </p>
                      )}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                          <p className="font-bold mb-1">Debug Info (Assignment Data):</p>
                          <p>Title: {assignment?.title || 'N/A'}</p>
                          <p>School: {assignment?.schoolName || 'N/A'}</p>
                          <p>Grade: {assignment?.gradeLevel || 'N/A'}</p>
                          <p>Writing Type: {assignment?.writingType || 'N/A'}</p>
                          <p>Level Count: {assignment?.levelCount || 'N/A'}</p>
                          <p>Domains: {assignment?.evaluationDomains?.join(', ') || 'N/A'}</p>
                          <p>Levels: {assignment?.evaluationLevels?.join(', ') || 'N/A'}</p>
                          <p>Criteria Length: {assignment?.gradingCriteria?.length || 0} chars</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              )}
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
          {!isEvaluating && evaluationTasks.length === 0 && submissions.length > 0 && (
            <button
              onClick={handleStartEvaluation}
              className="px-8 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 border border-blue-200/30 text-lg font-medium"
            >
              <Play className="w-5 h-5" />
              평가 시작
            </button>
          )}

          {evaluationTasks.length > 0 && completedCount === totalCount && (
            <>
              <button
                onClick={() => router.push(`/assignments/${params.assignmentId}/submissions`)}
                className="px-8 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 border border-blue-200/30 text-lg font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                제출 현황으로 돌아가기
              </button>
              <button
                onClick={() => router.push(`/assignments/${params.assignmentId}/dashboard`)}
                className="px-8 py-3 bg-green-500/20 text-slate-700 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 border border-green-200/30 text-lg font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                평가 결과 대시보드 보기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}