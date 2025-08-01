'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { ArrowLeft, Share2, UserPlus, UserMinus, Shield, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';

interface SharedUser {
  id: string;
  email: string;
  permission: 'read' | 'evaluate' | 'write';
  sharedByEmail: string;
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  isShared: boolean;
  userEmail: string;
}

export default function ShareAssignmentPage() {
  return (
    <AuthLayout>
      <ShareAssignmentContent />
    </AuthLayout>
  );
}

function ShareAssignmentContent() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'read' | 'evaluate' | 'write'>('read');
  const [sharing, setSharing] = useState(false);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    fetchAssignmentAndSharedUsers();
  }, [assignmentId]);

  const fetchAssignmentAndSharedUsers = async () => {
    try {
      // 과제 정보 가져오기
      const assignmentRes = await fetch(`/api/assignments/${assignmentId}`);
      const assignmentData = await assignmentRes.json();
      
      if (assignmentData.success) {
        setAssignment(assignmentData.assignment);
        setIsShared(assignmentData.assignment.isShared || false);
        
        // 권한 확인
        if (!assignmentData.assignment.permission?.canShare) {
          alert('이 과제를 공유할 권한이 없습니다.');
          router.push('/assignments');
          return;
        }
      }

      // 공유 사용자 목록 가져오기
      const sharedRes = await fetch(`/api/assignments/${assignmentId}/share`);
      const sharedData = await sharedRes.json();
      
      if (sharedData.success) {
        setSharedUsers(sharedData.sharedUsers || []);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSharing = async () => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/share`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isShared: !isShared })
      });

      const data = await res.json();
      if (data.success) {
        setIsShared(!isShared);
        alert(isShared ? '과제 공유가 비활성화되었습니다.' : '과제 공유가 활성화되었습니다.');
      }
    } catch (error) {
      console.error('공유 설정 오류:', error);
      alert('공유 설정 중 오류가 발생했습니다.');
    }
  };

  const handleShareUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || sharing) return;

    setSharing(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, permission })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setEmail('');
        setPermission('read');
        fetchAssignmentAndSharedUsers();
      } else {
        alert(data.error || '공유 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('사용자 공유 오류:', error);
      alert('사용자 공유 중 오류가 발생했습니다.');
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveShare = async (userEmail: string) => {
    if (!confirm(`${userEmail}님의 공유를 취소하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAssignmentAndSharedUsers();
      }
    } catch (error) {
      console.error('공유 취소 오류:', error);
      alert('공유 취소 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">과제를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-slate-50 to-purple-50/20">
      <div className="container-custom py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/assignments')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>과제 목록으로</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">과제 공유 관리</h1>
          <p className="text-slate-600">{assignment.title}</p>
        </div>

        {/* 공유 활성화/비활성화 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              공유 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-700 font-medium">과제 공유</p>
                <p className="text-sm text-slate-500 mt-1">
                  공유를 활성화하면 다른 사용자에게 이 과제를 공유할 수 있습니다.
                </p>
              </div>
              <button
                onClick={handleToggleSharing}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isShared
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isShared ? '활성화됨' : '비활성화'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 공유 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              사용자 공유
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleShareUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  이메일 주소
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  권한 설정
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      value="read"
                      checked={permission === 'read'}
                      onChange={(e) => setPermission(e.target.value as 'read')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-600" />
                      <div>
                        <p className="font-medium">읽기 전용</p>
                        <p className="text-sm text-slate-500">과제와 제출물을 열람만 가능</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      value="evaluate"
                      checked={permission === 'evaluate'}
                      onChange={(e) => setPermission(e.target.value as 'evaluate')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-600" />
                      <div>
                        <p className="font-medium">평가 가능</p>
                        <p className="text-sm text-slate-500">제출물 평가 및 열람 가능</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      value="write"
                      checked={permission === 'write'}
                      onChange={(e) => setPermission(e.target.value as 'write')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4 text-slate-600" />
                      <div>
                        <p className="font-medium">전체 권한</p>
                        <p className="text-sm text-slate-500">과제 수정, 제출물 관리, 평가 모두 가능</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={sharing || !email}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sharing ? '공유 중...' : '사용자 추가'}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* 공유된 사용자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              공유된 사용자 ({sharedUsers.length}명)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sharedUsers.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                아직 공유된 사용자가 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {sharedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-slate-600 font-medium">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.email}</p>
                        <p className="text-sm text-slate-500">
                          {user.permission === 'read' && '읽기 전용'}
                          {user.permission === 'evaluate' && '평가 가능'}
                          {user.permission === 'write' && '전체 권한'}
                          · {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveShare(user.email)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="공유 취소"
                    >
                      <UserMinus className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}