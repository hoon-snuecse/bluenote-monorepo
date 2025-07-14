'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AuthStatusClient() {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session-check')
      .then(res => res.json())
      .then(data => {
        setSessionData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to check session:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            인증 상태
          </h2>
        </div>
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          {loading ? (
            <p className="text-center">확인 중...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">상태</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {sessionData?.authenticated ? '로그인됨' : '로그인되지 않음'}
                </p>
              </div>
              
              {sessionData?.user && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">이메일</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{sessionData.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">이름</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{sessionData.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">관리자</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {sessionData.user.isAdmin ? '예' : '아니오'}
                    </p>
                  </div>
                </>
              )}
              
              {sessionData?.error && (
                <div>
                  <p className="text-sm font-medium text-red-500">오류</p>
                  <p className="mt-1 text-sm text-red-600">{sessionData.error}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 flex space-x-4">
            <Link
              href="/"
              className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              홈으로
            </Link>
            {(!sessionData?.authenticated && !loading) && (
              <Link
                href="/login"
                className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                로그인
              </Link>
            )}
            {(sessionData?.authenticated && !loading) && (
              <button
                onClick={() => window.location.href = '/api/auth/signout'}
                className="flex-1 text-center py-2 px-4 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                로그아웃
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}