'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FolderOpen, QrCode, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

const QRCode = dynamic(() => import('react-qr-code'), {
  ssr: false
});

export default function CollectSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'direct' | 'googleDrive'>('direct');
  const [submissionUrl, setSubmissionUrl] = useState('');

  useEffect(() => {
    // 학생 제출 URL 생성
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/submit/${params.assignmentId}`;
    setSubmissionUrl(url);
  }, [params.assignmentId]);

  const handleGoogleDriveSelect = () => {
    // import 페이지로 이동하면서 assignmentId를 전달
    router.push(`/import?assignmentId=${params.assignmentId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container-custom py-8 max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/assignments/${params.assignmentId}/submissions`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            제출 현황으로 돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">제출물 수집</h1>
          <p className="text-lg text-slate-600">학생들의 글쓰기를 수집하는 방법을 선택하세요</p>
        </div>

        {/* Method Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setSelectedMethod('direct')}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedMethod === 'direct'
                ? 'border-blue-400 bg-blue-50/50 shadow-lg'
                : 'border-slate-200/50 hover:border-slate-300/50 bg-white/70'
            }`}
          >
            <QrCode className="w-12 h-12 mb-4 mx-auto text-blue-600" />
            <h3 className="text-xl font-medium text-slate-800 mb-2">학생 직접 입력</h3>
            <p className="text-base text-slate-600">
              QR 코드나 링크로 학생이 직접 제출
            </p>
          </button>

          <button
            onClick={() => setSelectedMethod('googleDrive')}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedMethod === 'googleDrive'
                ? 'border-blue-400 bg-blue-50/50 shadow-lg'
                : 'border-slate-200/50 hover:border-slate-300/50 bg-white/70'
            }`}
          >
            <FolderOpen className="w-12 h-12 mb-4 mx-auto text-blue-600" />
            <h3 className="text-xl font-medium text-slate-800 mb-2">구글 드라이브 폴더</h3>
            <p className="text-base text-slate-600">
              공유 폴더에서 여러 파일 선택
            </p>
          </button>
        </div>

        {/* Method Content */}
        {selectedMethod === 'direct' && (
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
                  onClick={() => router.push(`/assignments/${params.assignmentId}/submissions`)}
                  className="px-6 py-3 bg-green-500/20 text-slate-700 rounded-lg hover:bg-green-500/30 transition-colors inline-flex items-center gap-2 border border-green-200/30 text-base font-medium"
                >
                  <Users className="w-5 h-5" />
                  제출 현황 확인
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMethod === 'googleDrive' && (
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-2xl text-center">구글 드라이브 폴더에서 선택</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <FolderOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg text-slate-600 mb-6">
                공유된 구글 드라이브 폴더에서 여러 문서를 한 번에 선택할 수 있습니다.
              </p>
              <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200/30 max-w-lg mx-auto mb-6">
                <p className="text-base text-blue-800">
                  이 기능은 <strong>bluenote.site</strong>에 구글 계정으로 로그인한 경우에만 사용 가능합니다.
                </p>
              </div>
              <button
                onClick={handleGoogleDriveSelect}
                className="px-6 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors inline-flex items-center gap-2 border border-blue-200/30 text-base font-medium"
              >
                <FolderOpen className="w-5 h-5" />
                구글 드라이브 열기
              </button>
              <p className="text-sm text-slate-500 mt-4">
                * bluenote.site 구글 계정 연동 필요
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}