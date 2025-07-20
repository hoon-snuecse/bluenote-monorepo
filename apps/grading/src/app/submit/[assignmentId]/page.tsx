'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { Send, FileText } from 'lucide-react';

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
    grade: '',
    class: '',
    number: '',
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
    
    if (!formData.studentName || !formData.grade || !formData.class || !formData.number || !formData.content.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    if (formData.content.length < 100) {
      alert('글은 최소 100자 이상 작성해주세요.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // 학번 자동 생성 (연도 + 학년 + 반 + 번호)
      const currentYear = new Date().getFullYear();
      const generatedStudentId = `${currentYear}${formData.grade.padStart(2, '0')}${formData.class.padStart(2, '0')}${formData.number.padStart(2, '0')}`;
      
      const submissionData = {
        assignmentId: params.assignmentId,
        assignmentTitle: assignment?.title,
        studentName: formData.studentName,
        studentId: generatedStudentId,
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
        // 제출 성공 화면으로 이동
        router.push(`/submit/${params.assignmentId}/success?title=${encodeURIComponent(assignment?.title || '')}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        {/* Simple Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{assignment.title}</h1>
          <p className="text-lg text-slate-600">{assignment.schoolName} · {assignment.gradeLevel}</p>
        </div>

        {/* Submission Form */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-xl">과제 제출</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label htmlFor="grade" className="block text-base font-medium text-gray-700 mb-2">
                    학년
                  </label>
                  <input
                    type="number"
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                    min="1"
                    max="6"
                    className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                    placeholder="1"
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="class" className="block text-base font-medium text-gray-700 mb-2">
                    반
                  </label>
                  <input
                    type="number"
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                    placeholder="1"
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="number" className="block text-base font-medium text-gray-700 mb-2">
                    번호
                  </label>
                  <input
                    type="number"
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                    placeholder="1"
                  />
                </div>
                <div className="md:col-span-1">
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