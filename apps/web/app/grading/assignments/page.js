'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Users, Calendar, FileText, BookOpen, School, Link, BarChart3, PieChart } from 'lucide-react';

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/grading/assignments');
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('과제 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    router.push('/grading/assignments/new');
  };

  const handleEditAssignment = (id) => {
    router.push(`/grading/assignments/${id}/edit`);
  };

  const handleDeleteAssignment = async (id) => {
    if (!confirm('정말로 이 과제를 삭제하시겠습니까?')) return;
    
    // Mock delete
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const handleGetSubmissionLink = (assignmentId) => {
    const link = `${window.location.origin}/grading/submit/${assignmentId}`;
    navigator.clipboard.writeText(link);
    alert(`제출 링크가 복사되었습니다!\n\n${link}\n\n이 링크를 학생들에게 공유하세요.`);
  };

  const handleViewSubmissions = (assignmentId) => {
    router.push(`/grading/assignments/${assignmentId}/submissions`);
  };

  const handleRunEvaluation = (assignmentId) => {
    router.push(`/grading/evaluate?assignmentId=${assignmentId}`);
  };

  const handleViewDashboard = (assignmentId) => {
    router.push(`/grading/dashboard/${assignmentId}`);
  };

  const handleViewAnalytics = (assignmentId) => {
    router.push(`/grading/analytics/${assignmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">과제 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-slate-50 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">과제 관리</h1>
            <p className="text-slate-600">평가할 과제를 생성하고 관리합니다</p>
          </div>
          <button
            onClick={handleCreateAssignment}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            새 과제 만들기
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div 
              key={assignment.id} 
              className="bg-white/70 backdrop-blur-sm border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-lg"
            >
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-2">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <School className="w-4 h-4" />
                      <span>{assignment.schoolName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{assignment.writingType}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleGetSubmissionLink(assignment.id)}
                      className="p-2 hover:bg-blue-50/50 rounded-lg transition-colors"
                      title="제출 링크 복사"
                    >
                      <Link className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleEditAssignment(assignment.id)}
                      className="p-2 hover:bg-slate-100/50 rounded-lg transition-colors"
                      title="과제 수정"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="p-2 hover:bg-red-50/50 rounded-lg transition-colors"
                      title="과제 삭제"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-1">
                    <span className="font-medium">대상:</span> {assignment.gradeLevel}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">평가 영역:</span> {assignment.evaluationDomains.join(', ')}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>생성일: {new Date(assignment.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{assignment.levelCount}단계 평가</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => handleViewSubmissions(assignment.id)}
                    className="px-3 py-2 bg-white/60 text-slate-700 rounded-lg hover:bg-white/80 transition-colors flex items-center justify-center gap-2 border border-slate-200/50 text-sm"
                  >
                    <Users className="w-4 h-4" />
                    제출 현황
                  </button>
                  <button
                    onClick={() => handleRunEvaluation(assignment.id)}
                    className="px-3 py-2 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 border border-blue-200/30 text-sm font-medium"
                  >
                    AI 평가
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleViewDashboard(assignment.id)}
                    className="px-3 py-2 bg-purple-500/20 text-slate-700 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2 border border-purple-200/30 text-sm font-medium"
                  >
                    <BarChart3 className="w-4 h-4" />
                    대시보드
                  </button>
                  <button
                    onClick={() => handleViewAnalytics(assignment.id)}
                    className="px-3 py-2 bg-green-500/20 text-slate-700 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2 border border-green-200/30 text-sm font-medium"
                  >
                    <PieChart className="w-4 h-4" />
                    통계 분석
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {assignments.length === 0 && !loading && (
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-lg">
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">아직 생성된 과제가 없습니다.</p>
              <button
                onClick={handleCreateAssignment}
                className="px-6 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors inline-flex items-center gap-2 border border-blue-200/30"
              >
                <Plus className="w-5 h-5" />
                첫 과제 만들기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}