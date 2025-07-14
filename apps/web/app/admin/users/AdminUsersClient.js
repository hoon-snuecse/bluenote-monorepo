'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Shield, 
  Edit2, 
  Trash2, 
  Plus,
  Check,
  X,
  MessageSquare,
  PenTool,
  Save,
  AlertCircle
} from 'lucide-react';

export default function AdminUsersClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ email: '', role: 'user', claude_daily_limit: 3, can_write: false });
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.user.isAdmin) {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setError('');
    setSuccess('');
    
    if (!newUser.email || !newUser.email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setSuccess('사용자가 추가되었습니다.');
        setNewUser({ email: '', role: 'user', claude_daily_limit: 3, can_write: false });
        setShowAddForm(false);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || '사용자 추가에 실패했습니다.');
      }
    } catch (error) {
      setError('사용자 추가 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateUser = async (email) => {
    setError('');
    setSuccess('');
    
    const user = editingUser;
    
    try {
      const res = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (res.ok) {
        setSuccess('사용자 정보가 업데이트되었습니다.');
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || '사용자 업데이트에 실패했습니다.');
      }
    } catch (error) {
      setError('사용자 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteUser = async (email) => {
    if (!confirm(`정말로 ${email} 사용자를 삭제하시겠습니까?`)) return;
    
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`/api/admin/users?email=${email}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccess('사용자가 삭제되었습니다.');
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || '사용자 삭제에 실패했습니다.');
      }
    } catch (error) {
      setError('사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (!session || !session.user.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">사용자 관리</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 사용자 추가
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="quote-sheet">
          <div className="relative">
            <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
            <div className="relative z-10 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">새 사용자 추가</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">역할</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">일반 사용자</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Claude 일일 사용 한도</label>
                  <input
                    type="number"
                    value={newUser.claude_daily_limit}
                    onChange={(e) => setNewUser({ ...newUser, claude_daily_limit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUser.can_write}
                      onChange={(e) => setNewUser({ ...newUser, can_write: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">글쓰기 권한</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  추가
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="quote-sheet">
        <div className="relative">
          <div className="absolute inset-4 border border-dashed border-slate-200 rounded-lg opacity-30"></div>
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-4 font-medium text-slate-700">사용자</th>
                  <th className="text-center p-4 font-medium text-slate-700">역할</th>
                  <th className="text-center p-4 font-medium text-slate-700">Claude 한도</th>
                  <th className="text-center p-4 font-medium text-slate-700">글쓰기</th>
                  <th className="text-center p-4 font-medium text-slate-700">가입일</th>
                  <th className="text-right p-4 font-medium text-slate-700">작업</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          {user.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-blue-600" />
                          ) : (
                            <User className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {editingUser?.email === user.email ? (
                        <select
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                          className="px-2 py-1 border border-slate-300 rounded text-sm"
                        >
                          <option value="user">일반</option>
                          <option value="admin">관리자</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role === 'admin' ? '관리자' : '일반'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {editingUser?.email === user.email ? (
                        <input
                          type="number"
                          value={editingUser.claude_daily_limit}
                          onChange={(e) => setEditingUser({ ...editingUser, claude_daily_limit: parseInt(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                          min="0"
                        />
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span>{user.claude_daily_limit}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {editingUser?.email === user.email ? (
                        <input
                          type="checkbox"
                          checked={editingUser.can_write}
                          onChange={(e) => setEditingUser({ ...editingUser, can_write: e.target.checked })}
                          className="w-4 h-4"
                        />
                      ) : (
                        user.can_write ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-300 mx-auto" />
                        )
                      )}
                    </td>
                    <td className="p-4 text-center text-sm text-slate-600">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {editingUser?.email === user.email ? (
                          <>
                            <button
                              onClick={() => handleUpdateUser(user.email)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {user.email !== session.user.email && (
                              <button
                                onClick={() => handleDeleteUser(user.email)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                등록된 사용자가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}