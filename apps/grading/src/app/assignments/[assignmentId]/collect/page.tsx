'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { ArrowLeft, QrCode, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

const QRCode = dynamic(() => import('react-qr-code'), {
  ssr: false
});

export default function CollectSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const [submissionUrl, setSubmissionUrl] = useState('');

  useEffect(() => {
    // 학생 제출 URL 생성
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/submit/${params.assignmentId}`;
    setSubmissionUrl(url);
  }, [params.assignmentId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container-custom py-8 max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/assignments')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            과제 관리로 돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center pt-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">제출물 수집</h1>
          <p className="text-lg text-slate-600">QR 코드나 링크를 통해 학생들의 글쓰기를 수집합니다</p>
        </div>

        {/* Direct Method Display */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-2xl text-center">학생 직접 입력</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QR Code */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">QR 코드</h3>
                  <div className="bg-white p-8 rounded-xl border border-slate-200/50 inline-block">
                    {submissionUrl && (
                      <QRCode
                        value={submissionUrl}
                        size={200}
                        level="H"
                      />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-4">
                    학생들이 스마트폰으로 스캔하여 제출
                  </p>
                </div>

                {/* URL */}
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-4">제출 링크</h3>
                  <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/30">
                    <p className="text-base font-mono text-blue-600 break-all mb-3">
                      {submissionUrl}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(submissionUrl)}
                      className="px-4 py-2 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors text-sm border border-blue-200/30"
                    >
                      링크 복사
                    </button>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium text-slate-800">학생 제출 시 입력 정보:</h4>
                    <ul className="space-y-2 text-base text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        학교명
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        학년
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        반
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        이름
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        글쓰기 내용
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => router.push(`/assignments/${params.assignmentId}/dashboard`)}
                  className="px-6 py-3 bg-green-500/20 text-slate-700 rounded-lg hover:bg-green-500/30 transition-colors inline-flex items-center gap-2 border border-green-200/30 text-base font-medium"
                >
                  <Users className="w-5 h-5" />
                  평가 대시보드
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}