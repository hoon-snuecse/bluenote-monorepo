'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, FileText, User, Calendar, CheckCircle, Clock, PlayCircle, FileInput } from 'lucide-react';

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: Date | null;
  content: string | null;
  status: 'submitted' | 'evaluated';
  evaluatedAt?: Date | null;
  evaluation?: any;
}

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'submitted' | 'evaluated'>('all');
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSubmissions();
  }, [params.assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.assignmentId}/submissions`);
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions.map((sub: any) => ({
          ...sub,
          submittedAt: sub.submittedAt ? new Date(sub.submittedAt) : null,
          evaluatedAt: sub.evaluatedAt ? new Date(sub.evaluatedAt) : null,
        })));
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (selectedStatus === 'all') return true;
    return submission.status === selectedStatus;
  });

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    evaluated: submissions.filter(s => s.status === 'evaluated').length,
  };

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/assignments/${params.assignmentId}/submissions/${submissionId}`);
  };

  const handleEvaluateAll = () => {
    // 평가할 submission IDs 수집
    const submissionIds = submissions
      .filter(s => s.status === 'submitted')
      .map(s => s.id);
    
    if (submissionIds.length === 0) {
      alert('평가할 제출물이 없습니다.');
      return;
    }

    // 평가 페이지로 이동
    router.push(`/assignments/${params.assignmentId}/evaluate?submissions=${submissionIds.join(',')}`);
  };
  
  const handleEvaluateSelected = () => {
    if (selectedSubmissions.size === 0) {
      alert('평가할 학생을 선택해주세요.');
      return;
    }
    
    const submissionIds = Array.from(selectedSubmissions);
    router.push(`/assignments/${params.assignmentId}/evaluate?submissions=${submissionIds.join(',')}`);
  };
  
  const toggleSubmissionSelection = (submissionId: string) => {
    const newSelection = new Set(selectedSubmissions);
    if (newSelection.has(submissionId)) {
      newSelection.delete(submissionId);
    } else {
      newSelection.add(submissionId);
    }
    setSelectedSubmissions(newSelection);
  };
  
  const toggleAllSelection = () => {
    if (selectedSubmissions.size === filteredSubmissions.length && filteredSubmissions.length > 0) {
      setSelectedSubmissions(new Set());
    } else {
      // 필터링된 모든 학생 선택 (평가 여부 관계없이)
      const allIds = filteredSubmissions.map(s => s.id);
      setSelectedSubmissions(new Set(allIds));
    }
  };

  const handleCollectMore = () => {
    router.push(`/assignments/${params.assignmentId}/collect`);
  };

  const handleCreateTestData = async () => {
    if (!confirm('테스트 제출물 5개를 생성하시겠습니까?')) return;
    
    try {
      const response = await fetch('/api/test/create-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignmentId: params.assignmentId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchSubmissions(); // 목록 새로고침
      } else {
        alert('테스트 데이터 생성 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating test data:', error);
      alert('테스트 데이터 생성 중 오류가 발생했습니다.');
    }
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">글쓰기 제출 현황</h1>
            <p className="text-slate-600">총 {submissions.length}개의 제출물</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCollectMore}
              className="px-6 py-3 bg-white text-slate-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 border border-slate-200"
            >
              <FileInput className="w-5 h-5" />
              글 가져오기
            </button>
            {process.env.NODE_ENV === 'development' && submissions.length === 0 && (
              <button
                onClick={handleCreateTestData}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                테스트 데이터 생성
              </button>
            )}
            {submissions.length > 0 && (
              <>
                {selectedSubmissions.size > 0 && (
                  <button
                    onClick={handleEvaluateSelected}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    선택한 학생 {Array.from(selectedSubmissions).some(id => 
                      submissions.find(s => s.id === id)?.status === 'evaluated'
                    ) ? '재평가' : '평가'}하기 ({selectedSubmissions.size}명)
                  </button>
                )}
                {selectedSubmissions.size === 0 && stats.submitted > 0 && (
                  <button
                    onClick={handleEvaluateAll}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    미평가 전체 평가하기 ({stats.submitted}개)
                  </button>
                )}
              </>
            )}
          </div>
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
            { value: 'submitted', label: '미평가', count: stats.submitted },
            { value: 'evaluated', label: '평가완료', count: stats.evaluated },
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
                    <th className="text-center p-4 font-medium text-base w-12">
                      {filteredSubmissions.length > 0 && (
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.size === filteredSubmissions.length && filteredSubmissions.length > 0}
                          onChange={toggleAllSelection}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                    </th>
                    <th className="text-left p-4 font-medium text-base">학생 이름</th>
                    <th className="text-left p-4 font-medium text-base">학번</th>
                    <th className="text-left p-4 font-medium text-base">제출 일시</th>
                    <th className="text-center p-4 font-medium text-base">상태</th>
                    <th className="text-center p-4 font-medium text-base">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="text-slate-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-lg">제출된 글이 없습니다.</p>
                          <button
                            onClick={handleCollectMore}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                          >
                            <FileInput className="w-4 h-4" />
                            글 가져오기
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="border-b hover:bg-blue-50/10 transition-colors">
                        <td className="text-center p-4">
                          <input
                            type="checkbox"
                            checked={selectedSubmissions.has(submission.id)}
                            onChange={() => toggleSubmissionSelection(submission.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-base font-medium text-slate-700">{submission.studentName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-base text-slate-600">{submission.studentId}</td>
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
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100/50 text-yellow-700 text-sm">
                              <Clock className="w-4 h-4" />
                              미평가
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleViewSubmission(submission.id)}
                              className="px-4 py-2 bg-white/60 text-slate-700 rounded-lg hover:bg-white/80 transition-colors text-sm border border-slate-200/50"
                            >
                              {submission.status === 'evaluated' ? '평가결과 보기' : '상세보기'}
                            </button>
                            {submission.status === 'submitted' && (
                              <button
                                onClick={() => router.push(`/assignments/${params.assignmentId}/evaluate?submissions=${submission.id}`)}
                                className="px-4 py-2 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors text-sm border border-blue-200/30 font-medium"
                              >
                                평가하기
                              </button>
                            )}
                            {submission.status === 'evaluated' && (
                              <button
                                onClick={() => router.push(`/assignments/${params.assignmentId}/evaluate?submissions=${submission.id}`)}
                                className="px-4 py-2 bg-amber-500/20 text-slate-700 rounded-lg hover:bg-amber-500/30 transition-colors text-sm border border-amber-200/30 font-medium"
                              >
                                재평가하기
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}