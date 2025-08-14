'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Download } from 'lucide-react';

function HTMLViewerContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const title = searchParams.get('title') || 'HTML Document';
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (url) {
      // Fetch the HTML content
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Failed to load HTML file');
          return response.text();
        })
        .then(html => {
          // Process the HTML to make it safe and add base URL for relative links
          const baseUrl = new URL(url).origin;
          
          // Add base tag to handle relative URLs in the HTML
          const processedHtml = html.replace(
            /<head[^>]*>/i,
            `$&<base href="${baseUrl}/" target="_blank">`
          );
          
          setHtmlContent(processedHtml);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [url]);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">파일을 찾을 수 없습니다</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">파일을 로드할 수 없습니다</h1>
          <p className="text-slate-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="뒤로 가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-medium text-gray-800">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="새 탭에서 열기"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <a
              href={url}
              download={title}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="다운로드"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <iframe
            srcDoc={htmlContent}
            title={title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export default function HTMLViewerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HTMLViewerContent />
    </Suspense>
  );
}