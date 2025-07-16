'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, User, Calendar, FileText, Award, Target, BookOpen, Lightbulb } from 'lucide-react';

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
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.submissionId]);

  const fetchData = async () => {
    try {
      // Fetch submission
      const submissionRes = await fetch(`/api/submissions/${params.submissionId}`);
      const submissionData = await submissionRes.json();
      if (submissionData.success) {
        setSubmission({
          ...submissionData.submission,
          submittedAt: new Date(submissionData.submission.submittedAt),
          evaluatedAt: submissionData.submission.evaluatedAt ? new Date(submissionData.submission.evaluatedAt) : undefined
        });
      }

      // Fetch assignment
      const assignmentRes = await fetch(`/api/assignments/${params.assignmentId}`);
      const assignmentData = await assignmentRes.json();
      if (assignmentData.success) {
        setAssignment(assignmentData.assignment);
      }

      // Fetch evaluation if exists
      if (submissionData.submission?.evaluatedAt) {
        const evalRes = await fetch(`/api/submissions/${params.submissionId}/evaluation`);
        const evalData = await evalRes.json();
        if (evalData.success) {
          setEvaluation(evalData.evaluation);
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">제출물 상세보기</h1>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{submission.studentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{submission.submittedAt.toLocaleString('ko-KR')}</span>
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
                  <div className="whitespace-pre-wrap bg-slate-50/50 p-6 rounded-lg border border-slate-200/50">
                    {submission.content}
                  </div>
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
                      <p className="text-sm text-slate-600">
                        평가일: {submission.evaluatedAt?.toLocaleString('ko-KR')}
                      </p>
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
                      {Object.entries(evaluation.domainEvaluations).map(([domain, level]) => (
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
                      ))}
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
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {evaluation.overallFeedback}
                    </p>
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