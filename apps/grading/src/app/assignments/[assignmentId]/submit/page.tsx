'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, FileText, Link, Upload, Check } from 'lucide-react';

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const [submitMethod, setSubmitMethod] = useState<'text' | 'googleDocs'>('text');
  const [textContent, setTextContent] = useState('');
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const validateGoogleDocsUrl = (url: string) => {
    return url.includes('docs.google.com/document');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Card className="bg-white/70 backdrop-blur-sm border border-green-200/50">
            <CardContent className="py-12 text-center">
              <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">제출 완료!</h2>
              <p className="text-lg text-slate-600 mb-6">
                과제가 성공적으로 제출되었습니다.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-green-500/20 text-slate-700 rounded-lg hover:bg-green-500/30 transition-colors border border-green-200/30"
              >
                홈으로 돌아가기
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            뒤로 가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">과제 제출</h1>
          <p className="text-lg text-slate-600">설득하는 글쓰기 - 환경 보호의 중요성</p>
        </div>

        {/* Submit Method Selection */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 mb-6">
          <CardHeader>
            <CardTitle className="text-xl">제출 방법 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setSubmitMethod('text')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  submitMethod === 'text'
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-slate-200/50 hover:border-slate-300/50'
                }`}
              >
                <FileText className="w-8 h-8 mb-3 mx-auto text-blue-600" />
                <h3 className="text-lg font-medium text-slate-800 mb-1">직접 입력</h3>
                <p className="text-sm text-slate-600">
                  이 페이지에서 직접 글을 작성합니다
                </p>
              </button>

              <button
                onClick={() => setSubmitMethod('googleDocs')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  submitMethod === 'googleDocs'
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-slate-200/50 hover:border-slate-300/50'
                }`}
              >
                <Link className="w-8 h-8 mb-3 mx-auto text-blue-600" />
                <h3 className="text-lg font-medium text-slate-800 mb-1">구글 독스 링크</h3>
                <p className="text-sm text-slate-600">
                  구글 독스 문서 링크를 제출합니다
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Form */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              {submitMethod === 'text' ? (
                <div>
                  <label htmlFor="content" className="block text-base font-medium text-gray-700 mb-3">
                    글쓰기 내용
                  </label>
                  <textarea
                    id="content"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    required
                    rows={15}
                    className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base resize-none"
                    placeholder="여기에 글을 작성하세요..."
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    최소 200자 이상 작성해주세요. (현재: {textContent.length}자)
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="googleDocsUrl" className="block text-base font-medium text-gray-700 mb-3">
                    구글 독스 문서 링크
                  </label>
                  <div className="space-y-4">
                    <input
                      id="googleDocsUrl"
                      type="url"
                      value={googleDocsUrl}
                      onChange={(e) => setGoogleDocsUrl(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                      placeholder="https://docs.google.com/document/d/..."
                    />
                    {googleDocsUrl && !validateGoogleDocsUrl(googleDocsUrl) && (
                      <p className="text-sm text-red-600">
                        올바른 구글 독스 링크를 입력해주세요.
                      </p>
                    )}
                    <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-200/30">
                      <h4 className="font-medium text-amber-900 mb-2">링크 공유 설정 안내</h4>
                      <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                        <li>구글 독스 문서를 열어주세요</li>
                        <li>우측 상단의 "공유" 버튼을 클릭하세요</li>
                        <li>"링크가 있는 모든 사용자"로 설정하세요</li>
                        <li>"뷰어" 권한으로 설정하세요</li>
                        <li>링크를 복사하여 위에 붙여넣어주세요</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-white/60 text-slate-700 rounded-lg hover:bg-white/80 transition-colors border border-slate-200/50 text-base"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    (submitMethod === 'text' && textContent.length < 200) ||
                    (submitMethod === 'googleDocs' && !validateGoogleDocsUrl(googleDocsUrl))
                  }
                  className="px-6 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 border border-blue-200/30 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      제출 중...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      과제 제출
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}