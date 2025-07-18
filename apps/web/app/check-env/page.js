'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function CheckEnv() {
  const { data: session } = useSession();
  const [envCheck, setEnvCheck] = useState(null);

  useEffect(() => {
    // 환경변수 체크 API 호출
    fetch('/api/check-env')
      .then(res => res.json())
      .then(data => setEnvCheck(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">환경 설정 확인</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">현재 사용자:</h2>
          <p>이메일: {session?.user?.email || '로그인 필요'}</p>
          <p>관리자: {session?.user?.isAdmin ? '예' : '아니오'}</p>
          <p>글쓰기 권한: {session?.user?.canWrite ? '예' : '아니오'}</p>
        </div>

        {envCheck && (
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold mb-2">서버 환경 확인:</h2>
            <p>ADMIN_EMAILS 설정: {envCheck.hasAdminEmails ? '있음' : '없음'}</p>
            <p>hoon@snuecse.org 포함: {envCheck.includesHoon ? '예' : '아니오'}</p>
            <p>관리자 이메일 개수: {envCheck.adminEmailCount}</p>
          </div>
        )}

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-bold mb-2">문제 해결:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>위에서 "ADMIN_EMAILS 설정"이 "없음"이면 환경변수 설정 필요</li>
            <li>"hoon@snuecse.org 포함"이 "아니오"면 환경변수에 추가 필요</li>
            <li>Vercel 또는 로컬 .env.local 파일 확인</li>
            <li>환경변수 형식: ADMIN_EMAILS=hoon@snuecse.org,other@email.com</li>
          </ol>
        </div>
      </div>
    </div>
  );
}