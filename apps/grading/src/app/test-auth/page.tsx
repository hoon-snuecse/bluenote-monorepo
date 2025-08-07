'use client';

import { useSupabaseAuth } from '@bluenote/supabase-auth';
import { createClient } from '@bluenote/supabase-auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { session, loading } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('계정이 생성되었습니다. 이메일을 확인해주세요.');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('로그인 성공!');
      router.push('/');
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
    } else {
      setMessage('로그아웃 되었습니다.');
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Auth 테스트 페이지</h1>

      {/* 현재 세션 상태 */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">현재 세션 상태:</h2>
        {session ? (
          <div>
            <p className="text-green-600">로그인됨</p>
            <p>이메일: {session.user?.email}</p>
            <p>ID: {session.user?.id}</p>
            <button
              onClick={handleSignOut}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <p className="text-gray-600">로그인되지 않음</p>
        )}
      </div>

      {/* 로그인 폼 */}
      {!session && (
        <div className="space-y-6">
          {/* 이메일/비밀번호 로그인 */}
          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-4">이메일/비밀번호 로그인</h2>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block mb-1">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  회원가입
                </button>
              </div>
            </form>
          </div>

          {/* OAuth 로그인 */}
          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-4">소셜 로그인</h2>
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              Google로 로그인
            </button>
          </div>
        </div>
      )}

      {/* 메시지 표시 */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          에러: {error}
        </div>
      )}
      {message && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
    </div>
  );
}