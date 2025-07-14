'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Send, User, School, FileText, CheckCircle } from 'lucide-react';

export default function SubmitPage() {
  const params = useParams();
  const assignmentId = params.assignmentId;
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    studentName: '',
    content: ''
  });

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await fetch('/api/grading/assignments');
      const data = await response.json();
      if (data.success) {
        const found = data.assignments.find(a => a.id === assignmentId);
        if (found) {
          setAssignment(found);
        } else {
          alert('과제를 찾을 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('과제 정보 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/grading/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId: assignmentId,
          ...formData
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitted(true);
      } else {
        throw new Error(result.error || '제출 실패');
      }
    } catch (error) {
      console.error('제출 실패:', error);
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">과제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">제출 완료!</h2>
          <p className="text-slate-600 mb-6">
            {formData.studentName} 학생의 과제가 성공적으로 제출되었습니다.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 text-left">
            <p className="text-sm text-slate-600">
              <span className="font-medium">과제명:</span> {assignment.title}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              <span className="font-medium">제출 시간:</span> {new Date().toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <div className="flex items-center gap-3 mb-4">
            <School className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{assignment.title}</h1>
              <p className="text-slate-600">{assignment.schoolName} · {assignment.gradeLevel}</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <p className="text-blue-800 font-medium mb-2">과제 안내</p>
            <p className="text-blue-700">글의 종류: {assignment.writingType}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            학생 정보
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
              placeholder="홍길동"
              className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              글쓰기 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={12}
              placeholder="여기에 글을 작성하세요..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm text-slate-600">
                현재 글자 수: <span className="font-medium text-slate-700">{formData.content.length}자</span>
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              초기화
            </button>
            <button
              type="submit"
              disabled={submitting || formData.content.length === 0}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  제출 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  제출하기
                </>
              )}
            </button>
          </div>
        </form>

        {/* Notice */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>제출 후에는 수정할 수 없으니 신중히 검토 후 제출해주세요.</p>
        </div>
      </div>
    </div>
  );
}