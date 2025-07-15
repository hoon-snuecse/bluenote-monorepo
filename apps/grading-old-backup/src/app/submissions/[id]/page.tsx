'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, FileText, User, Calendar, Award, MessageSquare } from 'lucide-react';

interface SubmissionData {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  studentId: string;
  content: string;
  schoolName: string;
  gradeLevel: string;
  writingType: string;
  submittedAt: string;
  status: string;
  evaluationId?: string;
}

interface EvaluationData {
  id: string;
  domainEvaluations: Record<string, {
    level: string;
    feedback: string;
    score: number;
  }>;
  overallLevel: string;
  overallFeedback: string;
  improvementSuggestions: string[];
  strengths: string[];
  evaluatedAt: string;
}

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissionData();
  }, [params.id]);

  const fetchSubmissionData = async () => {
    try {
      // 제출물 정보 가져오기
      const submissionsResponse = await fetch('/api/submissions');
      const submissionsData = await submissionsResponse.json();
      
      if (submissionsData.success) {
        const currentSubmission = submissionsData.submissions.find(
          (s: SubmissionData) => s.id === params.id
        );
        
        if (currentSubmission) {
          setSubmission(currentSubmission);
          
          // 평가 결과가 있다면 가져오기
          if (currentSubmission.evaluationId) {
            const evalResponse = await fetch(`/api/evaluations/${currentSubmission.evaluationId}`);
            const evalData = await evalResponse.json();
            
            if (evalData.success) {
              setEvaluation(evalData.evaluation);
            }
          }
        }
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    if (level.includes('매우 우수')) return 'bg-green-100 text-green-700';
    if (level.includes('우수')) return 'bg-blue-100 text-blue-700';
    if (level.includes('보통')) return 'bg-yellow-100 text-yellow-700';
    if (level.includes('미흡')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">제출물을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="py-8 px-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">제출물을 찾을 수 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/assignments/${submission.assignmentId}/submissions`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            제출 현황으로 돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">제출물 상세</h1>
          <p className="text-lg text-slate-600">{submission.assignmentTitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Student Info & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info */}
            <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  학생 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">이름</p>
                    <p className="font-medium">{submission.studentName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">학번</p>
                    <p className="font-medium">{submission.studentId}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">학교</p>
                    <p className="font-medium">{submission.schoolName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">학년</p>
                    <p className="font-medium">{submission.gradeLevel}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">글의 종류</p>
                    <p className="font-medium">{submission.writingType}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">제출 시간</p>
                    <p className="font-medium">{new Date(submission.submittedAt).toLocaleString('ko-KR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  제출 내용 ({submission.content.length}자)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {submission.content}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Evaluation Results */}
          <div className="space-y-6">
            {evaluation ? (
              <>
                {/* Overall Evaluation */}
                <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      종합 평가
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <span className={`inline-block px-4 py-2 rounded-full text-lg font-medium ${getLevelColor(evaluation.overallLevel)}`}>
                        {evaluation.overallLevel}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {evaluation.overallFeedback}
                    </p>
                  </CardContent>
                </Card>

                {/* Domain Evaluations */}
                <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                  <CardHeader>
                    <CardTitle className="text-lg">영역별 평가</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(evaluation.domainEvaluations).map(([domain, result]) => (
                        <div key={domain} className="border-b border-slate-100 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{domain}</p>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(result.level)}`}>
                              {result.level}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {result.feedback}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths & Improvements */}
                <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      피드백
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-sm text-green-700 mb-2">잘한 점</p>
                        <ul className="space-y-1">
                          {evaluation.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-orange-700 mb-2">개선할 점</p>
                        <ul className="space-y-1">
                          {evaluation.improvementSuggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-orange-500 mt-0.5">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-xs text-slate-500 text-center">
                  평가 완료: {new Date(evaluation.evaluatedAt).toLocaleString('ko-KR')}
                </div>
              </>
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="py-12 text-center">
                  <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">아직 평가되지 않았습니다.</p>
                  <button
                    onClick={() => router.push(`/assignments/${submission.assignmentId}/evaluate`)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    평가 실행하기
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