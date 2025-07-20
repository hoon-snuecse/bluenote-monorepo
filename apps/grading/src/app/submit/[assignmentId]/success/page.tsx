'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function SubmissionSuccessPage() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || '과제';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
      <div className="text-center px-4 max-w-lg">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-slate-800 mb-4">
          제출이 완료되었습니다!
        </h1>
        <p className="text-lg text-slate-600 mb-2">
          <span className="font-medium">{title}</span>로 글을 제출했습니다.
        </p>
        <p className="text-lg text-slate-600">
          수고 많았습니다.
        </p>
      </div>
    </div>
  );
}