'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Clock, 
  Eye,
  Brain,
  CheckCircle,
  XCircle,
  Search,
  Download
} from 'lucide-react';

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId;
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      // Fetch assignment info
      const assignmentRes = await fetch('/api/grading/assignments');
      const assignmentData = await assignmentRes.json();
      const currentAssignment = assignmentData.assignments?.find(a => a.id === assignmentId);
      setAssignment(currentAssignment);

      // Fetch submissions
      const submissionsRes = await fetch(`/api/grading/submissions?assignmentId=${assignmentId}`);
      const submissionsData = await submissionsRes.json();
      
      if (submissionsData.success) {
        setSubmissions(submissionsData.submissions);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submissionId) => {
    router.push(`/grading/submissions/${submissionId}`);
  };

  const handleBatchEvaluate = () => {
    if (selectedSubmissions.length === 0) {
      alert('평가할 제출물을 선택해주세요.');
      return;
    }
    router.push(`/grading/evaluate?assignmentId=${assignmentId}&submissions=${selectedSubmissions.join(',')}`);
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.length === filteredSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(filteredSubmissions.map(s => s.id));
    }
  };

  const handleSelectSubmission = (submissionId) => {
    if (selectedSubmissions.includes(submissionId)) {
      setSelectedSubmissions(selectedSubmissions.filter(id => id !== submissionId));
    } else {
      setSelectedSubmissions([...selectedSubmissions, submissionId]);
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.studentNumber.includes(searchTerm) ||
    submission.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">제출 현황을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-slate-50 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            뒤로 가기
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">제출 현황</h1>
              {assignment && (
                <p className="text-slate-600">{assignment.title}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600">총 제출</span>
                <p className="text-xl font-bold text-slate-800">{submissions.length}건</p>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-600">미평가</span>
                <p className="text-xl font-bold text-blue-800">
                  {submissions.filter(s => s.status === 'submitted').length}건
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="학생 이름, 학번, 반으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {selectedSubmissions.length === filteredSubmissions.length ? '전체 해제' : '전체 선택'}
              </button>
              <button
                onClick={handleBatchEvaluate}
                disabled={selectedSubmissions.length === 0}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-4 h-4" />
                선택 항목 AI 평가 ({selectedSubmissions.length})
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Excel 다운로드
              </button>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">학생 정보</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">제출 시간</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">글자 수</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      {searchTerm ? '검색 결과가 없습니다.' : '아직 제출된 과제가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.includes(submission.id)}
                          onChange={() => handleSelectSubmission(submission.id)}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{submission.studentName}</p>
                          <p className="text-sm text-slate-600">
                            {submission.className} · {submission.studentNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          {new Date(submission.submittedAt).toLocaleString('ko-KR')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{submission.content.length}자</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {submission.status === 'submitted' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                            <Clock className="w-3 h-3" />
                            미평가
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <CheckCircle className="w-3 h-3" />
                            평가완료
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleViewSubmission(submission.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {filteredSubmissions.length > 0 && (
          <div className="mt-6 text-center text-sm text-slate-600">
            전체 {submissions.length}건 중 {filteredSubmissions.length}건 표시
          </div>
        )}
      </div>
    </div>
  );
}