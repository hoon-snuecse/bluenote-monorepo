'use client';

import { Shield } from 'lucide-react';
import { AuthWrapper } from '@bluenote/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useNextAuth as useAuth } from '@bluenote/auth';

// 관리자 권한 확인 컴포넌트
function AdminContent({ children }) {
  const { user, status } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // 관리자가 아닌 경우 홈으로 리다이렉트
    if (status === 'authenticated' && user && !user.isAdmin) {
      router.push('/');
    }
  }, [user, status, router]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 text-white border-b border-slate-700 pt-2.5">
        <div className="container-custom py-6">
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-slate-300 mt-1">BlueNote Atelier 시스템 관리</p>
        </div>
      </div>
      
      <div className="container-custom py-8">
        {children}
      </div>
    </div>
  );
}

// 클라이언트 컴포넌트로 변경 (메타데이터는 page.js로 이동)
export default function AdminLayout({ children }) {
  return (
    <AuthWrapper 
      requireAuth={true}
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <p className="text-white">로딩 중...</p>
        </div>
      }
    >
      <AdminContent>{children}</AdminContent>
    </AuthWrapper>
  );
}