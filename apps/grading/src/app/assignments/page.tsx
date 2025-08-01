'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { Plus, Edit, Trash2, Calendar, FileText, BookOpen, School, Link, ChartBar, Upload, Sparkles, Share2, UserPlus, Globe } from 'lucide-react';
import { ShareAssignmentDialog } from '@/components/ShareAssignmentDialog';
import { SharedAssignmentsList } from '@/components/SharedAssignmentsList';

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
  isSample?: boolean;
  sampleOrder?: number;
  sampleCategory?: string;
  // 공유 관련 필드
  isOwner?: boolean;
  isShared?: boolean;
  isSharedToMe?: boolean;
  sharedPermission?: string;
  sharedByEmail?: string;
  sharedAt?: string;
  submissionCount?: number;
}

export default function AssignmentsPage() {
  return (
    <AuthLayout>
      <AssignmentsContent />
    </AuthLayout>
  );
}

function AssignmentsContent() {
  const router = useRouter();
  const [myAssignments, setMyAssignments] = useState<AssignmentData[]>([]);
  const [sampleAssignments, setSampleAssignments] = useState<AssignmentData[]>([]);
  const [sharedAssignments, setSharedAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');
  const [sharedPagination, setSharedPagination] = useState({ total: 0, page: 1, totalPages: 0 });

  useEffect(() => {
    if (activeTab === 'my') {
      fetchAssignments();
    } else {
      fetchSharedAssignments();
    }
  }, [activeTab]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments');
      const data = await response.json();
      if (data.success) {
        // 샘플 과제와 내 과제 분리
        const samples = data.assignments.filter((a: AssignmentData) => a.isSample);
        const myOwn = data.assignments.filter((a: AssignmentData) => !a.isSample);
        setSampleAssignments(samples);
        setMyAssignments(myOwn);
      }
    } catch (error) {
      console.error('과제 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    router.push('/assignments/new');
  };

  const handleEditAssignment = (id: string) => {
    router.push(`/assignments/${id}/edit`);
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('정말로 이 과제를 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('과제 삭제 실패:', error);
      alert('과제 삭제에 실패했습니다.');
    }
  };

  const handleGetSubmissionLink = (assignmentId: string) => {
    const link = `${window.location.origin}/submit/${assignmentId}`;
    navigator.clipboard.writeText(link);
    alert('제출 링크가 클립보드에 복사되었습니다!');
  };

  const handleShareAssignment = (assignment: AssignmentData) => {
    setSelectedAssignment({ id: assignment.id, title: assignment.title });
    setShareDialogOpen(true);
  };


  const handleViewDashboard = (assignmentId: string) => {
    router.push(`/assignments/${assignmentId}/dashboard`);
  };

  const handleCollectSubmissions = (assignmentId: string) => {
    router.push(`/assignments/${assignmentId}/collect`);
  };

  const fetchSharedAssignments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shared-assignments?page=${page}&limit=12`);
      const data = await response.json();
      
      if (data.success) {
        setSharedAssignments(data.assignments);
        setSharedPagination(data.pagination);
      }
    } catch (error) {
      console.error('공유 과제 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAssignment = async (assignmentId: string) => {
    if (!confirm('이 과제를 내 과제로 복사하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/copy`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('과제가 성공적으로 복사되었습니다.');
        setActiveTab('my');
        fetchAssignments();
      } else {
        alert(data.error || '과제 복사에 실패했습니다.');
      }
    } catch (error) {
      console.error('과제 복사 실패:', error);
      alert('과제 복사 중 오류가 발생했습니다.');
    }
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
      <div className="container-custom py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">과제 관리</h1>
            <p className="text-slate-600">평가할 과제를 생성하고 관리합니다</p>
          </div>
          <button
            onClick={handleCreateAssignment}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            새 과제 만들기
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('my')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              내 과제
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shared' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                공유 템플릿
              </div>
            </button>
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'my' ? (
          <>
            {/* 샘플 과제 섹션 */}
            {sampleAssignments.length > 0 && (
              <div className="mb-10">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-slate-800">샘플 과제</h2>
                  <span className="text-sm text-slate-600">(평가 시스템을 시작하기 좋은 예제)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sampleAssignments.map((assignment) => (
                    <Card 
                      key={assignment.id} 
                      className="glass card-hover border-2 border-yellow-200 bg-yellow-50/20"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-slate-800 mb-1 line-clamp-2">
                              {assignment.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <School className="w-4 h-4" />
                              <span>{assignment.schoolName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{assignment.writingType}</span>
                            </div>
                            {assignment.isShared && (
                              <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                <Globe className="w-3 h-3" />
                                <span>전체 공유중</span>
                              </div>
                            )}
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
                              onClick={() => handleShareAssignment(assignment)}
                              className="p-2 hover:bg-green-50/50 rounded-lg transition-colors"
                              title="과제 공유"
                            >
                              <Share2 className="w-4 h-4 text-green-600" />
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
                      </CardHeader>
                      <CardContent>
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

                        <div className="space-y-2">
                          <button
                            onClick={() => handleCollectSubmissions(assignment.id)}
                            className="w-full px-4 py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm font-medium border border-slate-200 shadow-sm hover:shadow"
                          >
                            <Upload className="w-4 h-4" />
                            학생 글 가져오기
                          </button>

                          <button
                            onClick={() => handleViewDashboard(assignment.id)}
                            className="w-full px-4 py-2.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-sm font-medium border border-slate-200"
                          >
                            <ChartBar className="w-4 h-4" />
                            평가 대시보드
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 내 과제 섹션 */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-800">내 과제</h2>
              </div>
              {myAssignments.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">아직 생성된 과제가 없습니다.</p>
                    <button
                      onClick={handleCreateAssignment}
                      className="px-6 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors inline-flex items-center gap-2 border border-blue-200/30"
                    >
                      <Plus className="w-5 h-5" />
                      첫 과제 만들기
                    </button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myAssignments.map((assignment) => (
                    <Card key={assignment.id} className="glass card-hover">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-slate-800 mb-1 line-clamp-2">
                              {assignment.title}
                            </CardTitle>
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
                            {assignment.isOwner && (
                              <button
                                onClick={() => handleShareAssignment(assignment)}
                                className="p-2 hover:bg-green-50/50 rounded-lg transition-colors"
                                title="과제 공유"
                              >
                                <Share2 className="w-4 h-4 text-green-600" />
                              </button>
                            )}
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
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-sm text-slate-600 mb-1">
                            <span className="font-medium">대상:</span> {assignment.gradeLevel}
                          </p>
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">평가 영역:</span> {assignment.evaluationDomains.join(', ')}
                          </p>
                          {assignment.isSharedToMe && (
                            <div className="mt-2 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md inline-flex items-center gap-1">
                              <UserPlus className="w-3 h-3" />
                              <span>{assignment.sharedByEmail}님이 공유</span>
                              <span className="text-green-600">({assignment.sharedPermission === 'write' ? '편집 가능' : assignment.sharedPermission === 'evaluate' ? '평가만' : '읽기만'})</span>
                            </div>
                          )}
                          {assignment.isShared && (
                            <div className="mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md inline-flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>전체 공유중</span>
                            </div>
                          )}
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

                        <div className="space-y-2">
                          <button
                            onClick={() => handleCollectSubmissions(assignment.id)}
                            className="w-full px-4 py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm font-medium border border-slate-200 shadow-sm hover:shadow"
                          >
                            <Upload className="w-4 h-4" />
                            학생 글 가져오기
                          </button>

                          <button
                            onClick={() => handleViewDashboard(assignment.id)}
                            className="w-full px-4 py-2.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-sm font-medium border border-slate-200"
                          >
                            <ChartBar className="w-4 h-4" />
                            평가 대시보드
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* 공유 템플릿 탭 */
          <SharedAssignmentsList 
            assignments={sharedAssignments} 
            onCopyAssignment={handleCopyAssignment}
          />
        )}
        
        {/* 공유 대화상자 */}
        {selectedAssignment && (
          <ShareAssignmentDialog
            assignmentId={selectedAssignment.id}
            assignmentTitle={selectedAssignment.title}
            isOpen={shareDialogOpen}
            onClose={() => {
              setShareDialogOpen(false);
              setSelectedAssignment(null);
              fetchAssignments(); // 공유 후 목록 새로고침
            }}
          />
        )}
      </div>
    </div>
  );
}