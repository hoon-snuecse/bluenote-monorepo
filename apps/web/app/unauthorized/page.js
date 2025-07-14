'use client';

import Link from 'next/link';
import { Shield, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h1>
        <p className="text-gray-600 mb-6">
          이 페이지는 관리자만 접근할 수 있습니다.
        </p>
        <div className="space-x-4">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Home className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}