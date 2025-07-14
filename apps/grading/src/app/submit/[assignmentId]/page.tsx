'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Send, BookOpen, School, FileText } from 'lucide-react';

interface AssignmentData {
  id: string;
  title: string;
  schoolName: string;
  gradeLevel: string;
  writingType: string;
  evaluationDomains: string[];
  evaluationLevels: string[];
  levelCount: string;
  gradingCriteria: string;
  createdAt: string;
}

export default function SubmitPage({ params }: { params: { assignmentId: string } }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    content: '',
  });

  useEffect(() => {
    fetchAssignment();
  }, [params.assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.assignmentId}`);
      const data = await response.json();
      
      if (data.success) {
        setAssignment(data.assignment);
      } else {
        alert('과제를 찾을 수 없습니다.');
        router.push('/');
      }
    } catch (error) {
      console.error('과제 조회 오류:', error);
      alert('과제를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.studentId || !formData.content.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    if (formData.content.length < 100) {
      alert('글은 최소 100자 이상 작성해주세요.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const submissionData = {
        assignmentId: params.assignmentId,
        assignmentTitle: assignment?.title,
        studentName: formData.studentName,
        studentId: formData.studentId,
        content: formData.content,
        schoolName: assignment?.schoolName,
        gradeLevel: assignment?.gradeLevel,
        writingType: assignment?.writingType,
      };
      
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('과제가 성공적으로 제출되었습니다!');
        router.push('/');
      } else {
        alert('과제 제출 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('과제 제출 오류:', error);
      alert('과제 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">과제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="py-8 px-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">과제를 찾을 수 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
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

        {/* Assignment Info */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <CardTitle className="text-2xl text-center">{assignment.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">{assignment.schoolName}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">{assignment.gradeLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">{assignment.writingType}</span>
              </div>
              <div className="text-slate-600">
                <span className="font-medium">평가: </span>{assignment.levelCount}단계
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50/50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-1">평가 영역</p>
              <p className="text-sm text-slate-600">{assignment.evaluationDomains.join(', ')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Submission Form */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-xl">과제 제출</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="studentName" className="block text-base font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label htmlFor="studentId" className="block text-base font-medium text-gray-700 mb-2">
                    학번
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                    placeholder="20241234"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="content" className="block text-base font-medium text-gray-700">
                    글 작성
                  </label>
                  <span className="text-sm text-slate-500">
                    {formData.content.length}자
                  </span>
                </div>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={15}
                  required
                  className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base resize-none"
                  placeholder={`${assignment.writingType}을(를) 작성해주세요. (최소 100자 이상)`}
                />
                {formData.content.length > 0 && formData.content.length < 100 && (
                  <p className="text-sm text-red-500 mt-1">
                    최소 100자 이상 작성해주세요. (현재 {formData.content.length}자)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 text-base"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? '제출 중...' : '과제 제출'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}