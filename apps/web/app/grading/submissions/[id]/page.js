'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Calendar,
  FileText,
  Brain,
  Eye,
  Download
} from 'lucide-react';

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id;
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      // Mock data - in real app, fetch from API
      const mockSubmission = {
        id: submissionId,
        assignmentId: '1',
        assignmentTitle: '2024 1학기 논설문 쓰기',
        studentName: '김민준',
        studentNumber: '20240301',
        className: '6학년 1반',
        content: `우리 사회에서 인공지능의 역할이 점점 커지고 있습니다. 저는 인공지능이 우리 삶을 더 편리하게 만들어준다고 생각합니다.

첫째, 인공지능은 우리의 일상생활을 도와줍니다. 예를 들어, AI 스피커는 음악을 틀어주고 날씨를 알려줍니다. 또한 스마트폰의 AI 비서는 일정을 관리해주고 알람을 설정해줍니다.

둘째, 인공지능은 학습에도 도움을 줍니다. AI 튜터는 학생 개개인의 수준에 맞춰 문제를 내주고 설명해줍니다. 이렇게 하면 모든 학생이 자신의 속도에 맞춰 공부할 수 있습니다.

셋째, 의료 분야에서도 인공지능이 활용됩니다. AI는 의사가 병을 진단하는 것을 도와주고, 새로운 약을 개발하는 데에도 사용됩니다.

하지만 인공지능을 사용할 때는 주의해야 할 점도 있습니다. 개인정보가 유출되지 않도록 조심해야 하고, AI에만 의존하지 말고 스스로 생각하는 능력도 기르야 합니다.

결론적으로, 인공지능은 우리에게 많은 도움을 주는 유용한 도구입니다. 앞으로도 인공지능을 현명하게 사용한다면 우리의 삶이 더욱 풍요로워질 것입니다.`,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        evaluation: null
      };
      
      setSubmission(mockSubmission);
    } catch (error) {
      console.error('제출물 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = () => {
    router.push(`/grading/evaluate?submissionId=${submissionId}`);
  };

  const handleExport = () => {
    // Export functionality would go here
    alert('PDF 내보내기 기능은 준비 중입니다.');
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

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">제출물을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-slate-50 to-purple-50/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-slate-800 mb-2">제출물 상세</h1>
              <p className="text-slate-600">{submission.assignmentTitle}</p>
            </div>
            <div className="flex gap-3">
              {submission.status === 'submitted' && (
                <button
                  onClick={handleEvaluate}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  AI 평가하기
                </button>
              )}
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                PDF 내보내기
              </button>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            학생 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">이름</p>
              <p className="font-medium text-slate-800">{submission.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">학번</p>
              <p className="font-medium text-slate-800">{submission.studentNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">반</p>
              <p className="font-medium text-slate-800">{submission.className}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>제출 시간: {new Date(submission.submittedAt).toLocaleString('ko-KR')}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            제출 내용
          </h2>
          <div className="prose max-w-none">
            <div className="bg-slate-50 rounded-lg p-6 text-slate-700 whitespace-pre-wrap">
              {submission.content}
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm text-slate-600">
            <span>글자 수: {submission.content.length}자</span>
            <span>단어 수: {submission.content.split(/\s+/).filter(word => word.length > 0).length}개</span>
          </div>
        </div>

        {/* Evaluation Result (if evaluated) */}
        {submission.evaluation && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              평가 결과
            </h2>
            {/* Evaluation content would go here */}
            <p className="text-slate-600">평가 결과가 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}