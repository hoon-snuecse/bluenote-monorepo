'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function DebugSession() {
  const { data: session, status, update } = useSession();

  useEffect(() => {
    if (session) {
      console.log('Full session data:', session);
    }
  }, [session]);

  const handleForceUpdate = async () => {
    console.log('Forcing session update...');
    await update();
    window.location.reload();
  };

  const handleSignOutAndIn = async () => {
    await signOut({ redirect: false });
    window.location.href = '/api/auth/signin';
  };

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">세션 디버그 페이지</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">현재 세션 정보:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2">사용자: {session?.user?.email || '없음'}</p>
          <p className="mb-2">관리자: {session?.user?.isAdmin ? '예' : '아니오'}</p>
          <p className="mb-2">글쓰기 권한: {session?.user?.canWrite ? '예' : '아니오'}</p>
        </div>

        <div className="space-x-4">
          <button 
            onClick={handleForceUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            세션 강제 업데이트
          </button>
          
          <button 
            onClick={handleSignOutAndIn}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            로그아웃 후 재로그인
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h3 className="font-bold mb-2">문제 해결 단계:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>위의 세션 정보에서 canWrite가 false인지 확인</li>
          <li>"세션 강제 업데이트" 버튼 클릭</li>
          <li>여전히 안 되면 "로그아웃 후 재로그인" 클릭</li>
          <li>브라우저 쿠키/캐시 완전 삭제 후 재시도</li>
        </ol>
      </div>
    </div>
  );
}