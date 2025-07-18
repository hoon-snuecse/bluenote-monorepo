'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { ArrowLeft, User, Calendar, FileText, Award, Target, BookOpen, Lightbulb, Edit, Save, X, History, ChevronLeft, ChevronRight } from 'lucide-react';

interface Submission {
  id: string;
  studentName: string;
  studentId: string;
  content: string;
  submittedAt: Date;
  evaluatedAt?: Date;
  evaluation?: any;
}

interface Evaluation {
  id: string;
  domainEvaluations: any;
  overallLevel: string;
  overallFeedback: string;
  improvementSuggestions: string[];
  strengths: string[];
  evaluatedAt: Date | string;
  evaluatedBy?: string;
}

// JSON 응답 형식을 제거하는 함수
function cleanFeedbackText(text: string): string {
  if (!text) return '';
  
  // 먼저 텍스트에 JSON이 포함되어 있는지 확인
  if (text.includes('"overallScore"') || text.includes('"domainScores"')) {
    // JSON 블록을 찾아서 제거
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonStartIndex < jsonEndIndex) {
      // JSON 블록 이후의 텍스트만 추출
      let cleanedText = text.substring(jsonEndIndex + 1).trim();
      
      // 남은 따옴표나 쉼표 제거
      cleanedText = cleanedText.replace(/^[,"'\s]+/, '').trim();
      
      // 텍스트가 비어있다면 JSON 블록 이전의 텍스트 확인
      if (!cleanedText) {
        cleanedText = text.substring(0, jsonStartIndex).trim();
      }
      
      // 여전히 비어있다면 원본 텍스트에서 JSON 패턴만 제거
      if (!cleanedText) {
        cleanedText = text.replace(/\{[\s\S]*?\}/g, '').trim();
      }
      
      return cleanedText;
    }
  }
  
  // JSON이 없으면 원본 텍스트 반환
  return text;
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [currentEvaluationIndex, setCurrentEvaluationIndex] = useState(0);
  const [assignment, setAssignment] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.submissionId]);

  const handleSave = async () => {
    if (!submission) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/submissions/${params.submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: editedName,
          content: editedContent,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmission({
          ...submission,
          studentName: editedName,
          content: editedContent,
        });
        setIsEditing(false);
        alert('저장되었습니다.');
      } else {
        alert('저장 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving submission:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (submission) {
      setEditedName(submission.studentName);
      setEditedContent(submission.content || '');
    }
    setIsEditing(false);
  };

  const fetchData = async () => {
    try {
      // Fetch submission
      const submissionRes = await fetch(`/api/submissions/${params.submissionId}`);
      const submissionData = await submissionRes.json();
      if (submissionData.success) {
        const submissionInfo = {
          ...submissionData.submission,
          submittedAt: new Date(submissionData.submission.submittedAt),
          evaluatedAt: submissionData.submission.evaluatedAt ? new Date(submissionData.submission.evaluatedAt) : undefined
        };
        setSubmission(submissionInfo);
        setEditedName(submissionInfo.studentName);
        setEditedContent(submissionInfo.content || '');
      }

      // Fetch assignment
      const assignmentRes = await fetch(`/api/assignments/${params.assignmentId}`);
      const assignmentData = await assignmentRes.json();
      if (assignmentData.success) {
        setAssignment(assignmentData.assignment);
      }

      // Fetch all evaluations if exists
      if (submissionData.submission?.evaluatedAt) {
        const evalRes = await fetch(`/api/submissions/${params.submissionId}/evaluations`);
        const evalData = await evalRes.json();
        if (evalData.success && evalData.evaluations.length > 0) {
          setEvaluations(evalData.evaluations);
          setEvaluation(evalData.evaluations[0]); // 최신 평가를 기본으로 표시
          setCurrentEvaluationIndex(0);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">제출물을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/assignments/${params.assignmentId}/submissions`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            제출 현황으로 돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">제출물 상세보기</h1>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-2 py-1 border rounded-md"
                      placeholder="학생 이름"
                    />
                  ) : (
                    <span>{submission.studentName}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{submission.submittedAt.toLocaleString('ko-KR')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  수정하기
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    취소
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  제출된 글
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  {isEditing ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full min-h-[400px] p-6 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none"
                      placeholder="글 내용을 입력하세요..."
                    />
                  ) : (
                    <div className="whitespace-pre-wrap bg-slate-50/50 p-6 rounded-lg border border-slate-200/50">
                      {submission.content}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evaluation */}
          <div className="space-y-6">
            {evaluation ? (
              <>
                {/* Overall Score */}
                <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      종합 평가
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${
                        evaluation.overallLevel === '매우 우수' ? 'text-green-600' :
                        evaluation.overallLevel === '우수' ? 'text-blue-600' :
                        evaluation.overallLevel === '보통' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {evaluation.overallLevel}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        평가일: {new Date(evaluation.evaluatedAt).toLocaleString('ko-KR')}
                      </p>
                      <p className="text-xs text-slate-500">
                        평가 모델: {evaluation.evaluatedBy || 'AI'}
                      </p>
                      {evaluations.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <button
                            onClick={() => {
                              const newIndex = currentEvaluationIndex + 1;
                              if (newIndex < evaluations.length) {
                                setCurrentEvaluationIndex(newIndex);
                                setEvaluation(evaluations[newIndex]);
                              }
                            }}
                            disabled={currentEvaluationIndex >= evaluations.length - 1}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-slate-600">
                            {currentEvaluationIndex + 1} / {evaluations.length} 차 평가
                          </span>
                          <button
                            onClick={() => {
                              const newIndex = currentEvaluationIndex - 1;
                              if (newIndex >= 0) {
                                setCurrentEvaluationIndex(newIndex);
                                setEvaluation(evaluations[newIndex]);
                              }
                            }}
                            disabled={currentEvaluationIndex === 0}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Domain Scores */}
                <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      영역별 평가
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(evaluation.domainEvaluations).map(([domain, evalData]) => {
                        // Handle both string and object formats
                        const level = typeof evalData === 'object' && evalData !== null 
                          ? (evalData as any).level 
                          : evalData;
                        
                        return (
                        <div key={domain} className="flex justify-between items-center">
                          <span className="text-sm text-slate-700">{domain}</span>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            level === '매우 우수' ? 'bg-green-100 text-green-700' :
                            level === '우수' ? 'bg-blue-100 text-blue-700' :
                            level === '보통' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {level as string}
                          </span>
                        </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback */}
                <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      종합 피드백
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px] max-h-[400px] overflow-y-auto p-4 bg-slate-50/50 rounded-lg border border-slate-200/50">
                        {cleanFeedbackText(evaluation.overallFeedback)}
                      </div>
                      {evaluation.overallFeedback && evaluation.overallFeedback.length > 500 && (
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50/50 to-transparent pointer-events-none rounded-b-lg"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths */}
                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <Card className="bg-green-50/50 backdrop-blur-sm border border-green-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <Lightbulb className="w-5 h-5" />
                        강점
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {evaluation.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Improvements */}
                {evaluation.improvementSuggestions && evaluation.improvementSuggestions.length > 0 && (
                  <Card className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <Target className="w-5 h-5" />
                        개선점
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {evaluation.improvementSuggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {/* 평가 히스토리 */}
                {evaluations.length > 1 && (
                  <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        평가 히스토리
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {evaluations.map((evalItem, index) => (
                          <button
                            key={evalItem.id}
                            onClick={() => {
                              setCurrentEvaluationIndex(index);
                              setEvaluation(evalItem);
                            }}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              index === currentEvaluationIndex
                                ? 'border-blue-400 bg-blue-50/50'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {index + 1}차 평가
                              </span>
                              <span className={`text-sm ${
                                evalItem.overallLevel === '매우 우수' ? 'text-green-600' :
                                evalItem.overallLevel === '우수' ? 'text-blue-600' :
                                evalItem.overallLevel === '보통' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {evalItem.overallLevel}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              {new Date(evalItem.evaluatedAt).toLocaleString('ko-KR')}
                              {evalItem.evaluatedBy && (
                                <span className="ml-2">• {evalItem.evaluatedBy}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="py-12 text-center">
                  <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">아직 평가되지 않았습니다.</p>
                  <button
                    onClick={() => router.push(`/assignments/${params.assignmentId}/evaluate?submissions=${submission.id}`)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    평가하기
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}