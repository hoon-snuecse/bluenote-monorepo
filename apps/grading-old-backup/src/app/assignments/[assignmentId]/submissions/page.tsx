'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, FileText, User, Calendar, CheckCircle, Clock } from 'lucide-react';
import { mockStudents } from '@/lib/mock-data';

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: Date | null;
  content: string | null;
  status: 'not_submitted' | 'submitted' | 'evaluated';
}

// Mock submissions
const generateMockSubmissions = (): Submission[] => {
  return mockStudents.map((student, index) => ({
    id: `submission-${student.id}`,
    studentId: student.id,
    studentName: student.name,
    submittedAt: index < 7 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
    content: index < 7 ? '학생이 제출한 글쓰기 내용...' : null,
    status: index < 5 ? 'evaluated' : index < 7 ? 'submitted' : 'not_submitted',
  }));
};

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const [submissions] = useState<Submission[]>(generateMockSubmissions());
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'submitted' | 'not_submitted' | 'evaluated'>('all');

  const filteredSubmissions = submissions.filter(submission => {
    if (selectedStatus === 'all') return true;
    return submission.status === selectedStatus;
  });

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status !== 'not_submitted').length,
    evaluated: submissions.filter(s => s.status === 'evaluated').length,
  };

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/assignments/${params.assignmentId}/submissions/${submissionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">글쓰기 제출 현황</h1>
          <p className="text-slate-600">설득하는 글쓰기 - 환경 보호의 중요성</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
              <div className="text-base text-slate-600 mt-1">전체 학생</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
              <div className="text-base text-slate-600 mt-1">제출 완료</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.evaluated}</div>
              <div className="text-base text-slate-600 mt-1">평가 완료</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: '전체', count: stats.total },
            { value: 'submitted', label: '제출함', count: stats.submitted - stats.evaluated },
            { value: 'evaluated', label: '평가완료', count: stats.evaluated },
            { value: 'not_submitted', label: '미제출', count: stats.total - stats.submitted },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value as any)}
              className={`px-4 py-2 rounded-lg transition-all text-base ${
                selectedStatus === tab.value
                  ? 'bg-blue-500/20 text-blue-700 border border-blue-200/30'
                  : 'bg-white/50 text-slate-600 hover:bg-white/70 border border-slate-200/50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Submissions List */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gradient-to-r from-blue-50/10 to-indigo-50/10">
                    <th className="text-left p-4 font-medium text-base">학생 이름</th>
                    <th className="text-left p-4 font-medium text-base">학번</th>
                    <th className="text-left p-4 font-medium text-base">제출 일시</th>
                    <th className="text-center p-4 font-medium text-base">상태</th>
                    <th className="text-center p-4 font-medium text-base">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => {
                    const student = mockStudents.find(s => s.id === submission.studentId);
                    return (
                      <tr key={submission.id} className="border-b hover:bg-blue-50/10 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-base font-medium text-slate-700">{submission.studentName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-base text-slate-600">{student?.studentNumber}</td>
                        <td className="p-4">
                          {submission.submittedAt ? (
                            <div className="flex items-center gap-2 text-base text-slate-600">
                              <Calendar className="w-4 h-4" />
                              {submission.submittedAt.toLocaleString('ko-KR')}
                            </div>
                          ) : (
                            <span className="text-base text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {submission.status === 'evaluated' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100/50 text-green-700 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              평가완료
                            </span>
                          ) : submission.status === 'submitted' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm">
                              <FileText className="w-4 h-4" />
                              제출함
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/50 text-slate-600 text-sm">
                              <Clock className="w-4 h-4" />
                              미제출
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            {submission.status !== 'not_submitted' && (
                              <button
                                onClick={() => handleViewSubmission(submission.id)}
                                className="px-4 py-2 bg-white/60 text-slate-700 rounded-lg hover:bg-white/80 transition-colors text-sm border border-slate-200/50"
                              >
                                상세보기
                              </button>
                            )}
                            <button
                              onClick={() => router.push(`/assignments/${params.assignmentId}/collect`)}
                              className="px-4 py-2 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors text-sm border border-blue-200/30"
                            >
                              제출 수집
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}