'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@bluenote/ui';
import { Button } from '@bluenote/ui';
import { Input } from '@bluenote/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bluenote/ui';
import { UserPlus, X, Shield, Eye, Edit3, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen) {
      fetchSharedUsers();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>과제 공유 관리</DialogTitle>
          <DialogDescription>
            "{assignmentTitle}" 과제를 다른 사용자와 공유합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}