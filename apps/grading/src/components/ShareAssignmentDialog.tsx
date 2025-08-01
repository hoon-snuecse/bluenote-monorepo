'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@bluenote/ui';
import { Button } from '@bluenote/ui';
import { Input } from '@bluenote/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bluenote/ui';
import { UserPlus, X, Shield, Eye, Edit3, AlertCircle, Globe, Users, Info } from 'lucide-react';

interface SharedUser {
  id: string;
  email: string;
  permission: 'read' | 'evaluate' | 'write';
  sharedByEmail: string;
  createdAt: string;
}

interface ShareAssignmentDialogProps {
  assignmentId: string;
  assignmentTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareAssignmentDialog({ 
  assignmentId, 
  assignmentTitle, 
  isOpen, 
  onClose 
}: ShareAssignmentDialogProps) {
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPermission, setNewPermission] = useState<'read' | 'evaluate' | 'write'>('read');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPublicShared, setIsPublicShared] = useState(false);
  const [shareMode, setShareMode] = useState<'private' | 'public'>('private');

  useEffect(() => {
    if (isOpen) {
      fetchSharedUsers();
      checkPublicShareStatus();
    }
  }, [isOpen, assignmentId]);

  const fetchSharedUsers = async () => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/share`);
      const data = await response.json();
      if (data.success) {
        setSharedUsers(data.sharedUsers);
      }
    } catch (error) {
      console.error('공유 사용자 목록 조회 실패:', error);
    }
  };

  const checkPublicShareStatus = async () => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`);
      const data = await response.json();
      if (data.success && data.assignment) {
        setIsPublicShared(data.assignment.isShared || false);
      }
    } catch (error) {
      console.error('공유 상태 확인 실패:', error);
    }
  };

  const handleShare = async () => {
    if (!newEmail.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          permission: newPermission
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewEmail('');
        setNewPermission('read');
        await fetchSharedUsers();
      } else {
        setError(data.error || '공유에 실패했습니다.');
      }
    } catch (error) {
      setError('공유 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (email: string) => {
    if (!confirm(`${email}님과의 공유를 취소하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        await fetchSharedUsers();
      }
    } catch (error) {
      console.error('공유 취소 실패:', error);
    }
  };

  const handleUpdatePermission = async (email: string, newPermission: string) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          permission: newPermission
        })
      });

      if (response.ok) {
        await fetchSharedUsers();
      }
    } catch (error) {
      console.error('권한 변경 실패:', error);
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'write':
        return <Edit3 className="w-4 h-4" />;
      case 'evaluate':
        return <Shield className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'write':
        return '편집 가능';
      case 'evaluate':
        return '평가만';
      default:
        return '읽기만';
    }
  };

  const handlePublicShare = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/share`, {
        method: isPublicShared ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (data.success) {
        setIsPublicShared(!isPublicShared);
        await checkPublicShareStatus();
      } else {
        setError(data.error || '전체 공유 설정에 실패했습니다.');
      }
    } catch (error) {
      setError('전체 공유 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>과제 공유 관리</DialogTitle>
          <DialogDescription>
            "{assignmentTitle}" 과제를 공유합니다.
          </DialogDescription>
        </DialogHeader>

        {/* 공유 모드 탭 */}
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setShareMode('private')}
            className={`flex-1 rounded-md py-2 px-3 text-sm font-medium transition-colors ${
              shareMode === 'private'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            특정 사용자와 공유
          </button>
          <button
            onClick={() => setShareMode('public')}
            className={`flex-1 rounded-md py-2 px-3 text-sm font-medium transition-colors ${
              shareMode === 'public'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            전체 공유
          </button>
        </div>

        <div className="space-y-4">
          {shareMode === 'public' ? (
            /* 전체 공유 섹션 */
            <>
              {/* 전체 공유 상태 */}
              <div className={`rounded-lg p-4 border-2 ${
                isPublicShared 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className={`w-8 h-8 ${
                      isPublicShared ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {isPublicShared ? '전체 공유 중' : '전체 공유 비활성'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isPublicShared 
                          ? '모든 사용자가 이 평가 템플릿을 볼 수 있습니다'
                          : '이 과제는 아직 공개되지 않았습니다'
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handlePublicShare}
                    disabled={isLoading}
                    variant={isPublicShared ? 'outline' : 'default'}
                    size="sm"
                  >
                    {isLoading ? '처리 중...' : (isPublicShared ? '공유 취소' : '공유하기')}
                  </Button>
                </div>
              </div>

              {/* 전체 공유 안내 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-800">
                      전체 공유 시 다음 정보가 공개됩니다:
                    </p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• 평가 영역 및 수준 설정</li>
                      <li>• 채점 기준 및 루브릭</li>
                      <li>• 과제 기본 정보 (제목, 학년, 글쓰기 유형)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 개인정보 보호 안내 */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 mb-1">
                      학생 정보는 보호됩니다
                    </p>
                    <p className="text-amber-700">
                      학생 이름, 제출물, 평가 결과 등은 공유되지 않습니다.
                      다른 교사가 템플릿을 복사하면 독립적인 새 과제가 생성됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* 개별 공유 섹션 */
            <>
              {/* 새 사용자 추가 */}
              <div className="flex gap-2">
            <Input
              type="email"
              placeholder="이메일 주소 입력"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleShare()}
              className="flex-1"
            />
            <Select value={newPermission} onValueChange={(value: any) => setNewPermission(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">읽기만</SelectItem>
                <SelectItem value="evaluate">평가만</SelectItem>
                <SelectItem value="write">편집 가능</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleShare} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              추가
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* 공유된 사용자 목록 */}
          <div className="border rounded-lg divide-y">
            {sharedUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                아직 공유된 사용자가 없습니다.
              </div>
            ) : (
              sharedUsers.map((user) => (
                <div key={user.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}에 공유됨
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={user.permission} 
                      onValueChange={(value) => handleUpdatePermission(user.email, value)}
                    >
                      <SelectTrigger className="w-32 h-8 text-sm">
                        <div className="flex items-center gap-1">
                          {getPermissionIcon(user.permission)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">읽기만</SelectItem>
                        <SelectItem value="evaluate">평가만</SelectItem>
                        <SelectItem value="write">편집 가능</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => handleRemoveShare(user.email)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                      title="공유 취소"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

              {/* 권한 설명 */}
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                <div className="font-medium text-gray-700">권한 설명</div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Eye className="w-4 h-4 mt-0.5" />
                  <div>
                    <span className="font-medium">읽기만:</span> 과제 내용과 제출된 글을 볼 수 있습니다.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Shield className="w-4 h-4 mt-0.5" />
                  <div>
                    <span className="font-medium">평가만:</span> 과제를 보고 학생 글을 평가할 수 있습니다.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Edit3 className="w-4 h-4 mt-0.5" />
                  <div>
                    <span className="font-medium">편집 가능:</span> 과제를 수정하고 평가할 수 있습니다.
                  </div>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}