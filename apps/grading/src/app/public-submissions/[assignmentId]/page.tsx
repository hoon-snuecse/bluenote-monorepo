'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { ArrowLeft, FileText, User, Calendar, CheckCircle, Clock } from 'lucide-react';

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: Date | null;
  content: string | null;
  status: 'submitted' | 'evaluated';
  evaluatedAt?: Date | null;
}

interface Assignment {
  id: string;
  title: string;
  schoolName: string;
  gradeLevel: string;
  writingType: string;
}

export default function PublicSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.assignmentId]);

  const fetchData = async () => {
    try {
      // 과제 정보 가져오기
      const assignmentRes = await fetch(`/api/assignments/${params.assignmentId}`);
      const assignmentData = await assignmentRes.json();
      
      if (assignmentData.success) {
        setAssignment(assignmentData.assignment);
      }

      // 제출물 가져오기
      console.log('[Public Submissions] Fetching from:', `/api/assignments/${params.assignmentId}/submissions`);
      const submissionsRes = await fetch(`/api/assignments/${params.assignmentId}/submissions`);
      const submissionsData = await submissionsRes.json();
      console.log('[Public Submissions] Response:', submissionsData);
      
      if (submissionsData.success) {
        console.log('[Public Submissions] Found submissions:', submissionsData.submissions.length);
        setSubmissions(submissionsData.submissions.map((sub: any) => ({
          ...sub,
          submittedAt: sub.submittedAt ? new Date(sub.submittedAt) : null,
          evaluatedAt: sub.evaluatedAt ? new Date(sub.evaluatedAt) : null,
        })));
      } else {
        console.error('[Public Submissions] Failed to fetch:', submissionsData.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    evaluated: submissions.filter(s => s.status === 'evaluated').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">제출물을 불러오는 중...</p>
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
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {assignment?.title || '글쓰기 제출 현황'}
          </h1>
          <p className="text-lg text-slate-600">
            {assignment && assignment.schoolName && assignment.gradeLevel && assignment.writingType && 
              `${assignment.schoolName} • ${assignment.gradeLevel} • ${assignment.writingType}`}
          </p>
          <p className="text-slate-600 mt-2">총 {submissions.length}개의 제출물</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
              <div className="text-base text-slate-600 mt-1">전체 제출</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
              <div className="text-base text-slate-600 mt-1">평가 대기</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.evaluated}</div>
              <div className="text-base text-slate-600 mt-1">평가 완료</div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg text-slate-600">아직 제출된 글이 없습니다.</p>
              <p className="text-sm text-slate-500 mt-2">
                학생들이 제출 링크를 통해 글을 제출하면 여기에 표시됩니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-slate-500" />
                        <h3 className="text-lg font-medium text-slate-800">
                          {submission.studentName}
                        </h3>
                        <span className="text-sm text-slate-500">
                          (학번: {submission.studentId})
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {submission.submittedAt
                            ? submission.submittedAt.toLocaleString('ko-KR')
                            : '제출 시간 없음'}
                        </div>
                        {submission.content && submission.content.length > 0 && (
                          <span className="text-slate-500">
                            {submission.content.length}자
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.status === 'evaluated' ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4" />
                          평가완료
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          <Clock className="w-4 h-4" />
                          평가대기
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}