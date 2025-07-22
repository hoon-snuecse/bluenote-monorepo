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
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session || !session.user.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mt-1.5">
        <h1 className="text-2xl font-bold text-white">사용자 관리</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 사용자 추가
          </button>
          <Link
            href="/admin/dashboard"
            className="flex items-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            관리자 대시보드로
          </Link>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}


      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">새 사용자 추가</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">이메일</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                  <p className="text-xs text-slate-400 mt-1">* Google Cloud Console에도 추가 필요</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">역할</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">일반 사용자</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Claude 일일 사용 한도</label>
                  <input
                    type="number"
                    value={newUser.claude_daily_limit}
                    onChange={(e) => setNewUser({ ...newUser, claude_daily_limit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <span className="text-sm font-medium text-slate-300">글쓰기 권한</span>
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
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  취소
                </button>
              </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 font-medium text-slate-300">사용자</th>
                <th className="text-center p-4 font-medium text-slate-300">역할</th>
                <th className="text-center p-4 font-medium text-slate-300">Claude 한도</th>
                <th className="text-center p-4 font-medium text-slate-300">글쓰기</th>
                <th className="text-center p-4 font-medium text-slate-300">가입일</th>
                <th className="text-right p-4 font-medium text-slate-300">작업</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                          {user.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-blue-400" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {editingUser?.email === user.email ? (
                        <select
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                          className="px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded text-sm"
                        >
                          <option value="user">일반</option>
                          <option value="admin">관리자</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-blue-900/50 text-blue-300' 
                            : 'bg-slate-700 text-slate-300'
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
                          className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded text-sm text-center"
                          min="0"
                        />
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <MessageSquare className="w-4 h-4 text-slate-500" />
                          <span className="text-white">{user.claude_daily_limit}</span>
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
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 mx-auto" />
                        )
                      )}
                    </td>
                    <td className="p-4 text-center text-sm text-slate-400">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {editingUser?.email === user.email ? (
                          <>
                            <button
                              onClick={() => handleUpdateUser(user.email)}
                              className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {user.email !== session.user.email && (
                              <button
                                onClick={() => handleDeleteUser(user.email)}
                                className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
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
              <div className="text-center py-12 text-slate-400">
                등록된 사용자가 없습니다.
              </div>
            )}
        </div>
      </div>

      {/* OAuth Status Notice */}
      <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="text-sm text-yellow-400">
            <p className="font-semibold mb-1">Google OAuth 테스트 모드 안내</p>
            <p className="mb-2">현재 Google OAuth가 테스트 모드로 운영 중입니다. 새로운 사용자가 로그인하려면:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>먼저 아래에서 사용자 이메일을 등록하세요</li>
              <li>Google Cloud Console에서 테스트 사용자로 추가해야 합니다</li>
              <li>또는 Google 앱 인증을 완료하면 모든 사용자가 로그인 가능합니다</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}