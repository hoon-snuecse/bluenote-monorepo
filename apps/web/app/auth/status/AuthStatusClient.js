'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AuthStatusClient() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            인증 상태
          </h2>
        </div>
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">상태</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {status === 'loading' ? '확인 중...' : status === 'authenticated' ? '로그인됨' : '로그인되지 않음'}
              </p>
            </div>
            
            {session?.user && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500">이메일</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{session.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">이름</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{session.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">관리자</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {session.user.isAdmin ? '예' : '아니오'}
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-6 flex space-x-4">
            <Link
              href="/"
              className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              홈으로
            </Link>
            {!session && (
              <Link
                href="/login"
                className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}