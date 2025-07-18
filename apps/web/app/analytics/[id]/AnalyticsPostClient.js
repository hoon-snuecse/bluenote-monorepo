'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Tag, Edit, Trash2, BarChart2, Network, Plus, FileText, Download, Music, Video, Eye } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const iconMap = {
  pisa: BarChart2,
  sna: Network,
  others: Plus,
};

export default function AnalyticsPostClient({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  
  const { data: session } = useSession();
  
  // 임시 관리자 이메일 체크
  const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
  const isAdminEmail = session?.user?.email && adminEmails.includes(session.user.email);
  const hasEditPermission = session?.user?.isAdmin || session?.user?.canWrite || isAdminEmail;

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/posts/supabase');
      if (response.ok) {
        const data = await response.json();
        const foundPost = data.posts.find(p => p.id.toString() === id.toString());
        if (foundPost) {
          console.log('Found post:', foundPost);
          setPost(foundPost);
        } else {
          router.push('/analytics');
        }
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPost();
    setTimeout(() => setFadeIn(true), 100);
  }, [fetchPost]);

  const handleDelete = async () => {
    if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/analytics/posts/supabase?id=${post.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/analytics');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('글 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const Icon = iconMap[post.category] || BarChart2;

  // Get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (!mimeType) return FileText;
    
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.startsWith('video/')) return Video;
    return FileText;
  };

  // Convert markdown-style formatting to HTML
  const formatContent = (content) => {
    if (!content) return '';
    
    // First, handle images
    let formatted = content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (match, alt, src) => {
        // Handle all image URLs (Supabase or others)
        return `<div class="my-4"><img src="${src}" alt="${alt}" class="max-w-full rounded-lg shadow-md mx-auto" style="max-width: 600px; max-height: 400px; object-fit: contain;" /></div>`;
      }
    );
    
    // Handle headers with better spacing
    formatted = formatted
      .replace(/^##### (.*$)/gim, '<h5 class="text-lg font-semibold text-slate-800 mt-8 mb-3">$1</h5>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-xl font-semibold text-slate-800 mt-8 mb-3">$1</h4>')
      .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold text-slate-900 mt-10 mb-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold text-slate-900 mt-12 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold text-slate-900 mt-12 mb-6">$1</h1>');
    
    // Handle lists with better spacing
    formatted = formatted
      .replace(/^\* (.+)$/gim, '<li class="ml-6 mb-2">$1</li>')
      .replace(/^- (.+)$/gim, '<li class="ml-6 mb-2">$1</li>')
      .replace(/^\d+\. (.+)$/gim, '<li class="ml-6 mb-2">$1</li>');
    
    // Wrap consecutive list items
    formatted = formatted
      .replace(/(<li class="ml-6 mb-2">.*<\/li>\n?)(?=<li class="ml-6 mb-2">)/g, '$1')
      .replace(/(<li class="ml-6 mb-2">.*<\/li>)/g, '<ul class="list-disc list-inside mb-6">$1</ul>')
      .replace(/<\/ul>\n?<ul class="list-disc list-inside mb-6">/g, '');
    
    // Handle inline formatting
    formatted = formatted
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-100 text-slate-800 rounded text-sm">$1</code>');
    
    // Handle blockquotes
    formatted = formatted.replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 my-4 text-slate-600 italic">$1</blockquote>');
    
    // Handle paragraphs with better spacing
    const paragraphs = formatted.split('\n\n');
    formatted = paragraphs
      .map(p => {
        if (p.startsWith('<')) return p;
        if (p.trim() === '') return '';
        return `<p class="mb-6 leading-relaxed">${p}</p>`;
      })
      .join('\n');
    
    return formatted;
  };

  return (
    <div className={`transition-all duration-1000 ${
      fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <article className="container-custom max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-200 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'Asia/Seoul'
                }) : '날짜 없음'}
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
          
          {post.summary && (
            <p className="text-xl text-slate-600 mb-6">{post.summary}</p>
          )}
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Admin Controls */}
          {hasEditPermission && (
            <div className="flex items-center gap-2">
              <Link
                href={`/analytics/write?id=${post.id}`}
                className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                title="수정"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-slate-600 hover:text-red-600 transition-colors"
                title="삭제"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </header>

        {/* AI Generated Notice */}
        {post.isAIGenerated && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              이 글은 AI와 함께 작성되었습니다.
            </p>
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none text-slate-700"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />

        {/* Files Section */}
        {post.files && post.files.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">첨부 파일</h3>
            <div className="space-y-2">
              {post.files.map((file) => {
                const FileIcon = getFileIcon(file.type);
                const isHtml = file.type === 'text/html' || file.name.endsWith('.html');
                
                if (isHtml) {
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <FileIcon className="w-5 h-5 text-slate-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{file.name}</p>
                        <p className="text-xs text-slate-500">HTML 문서</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const previewUrl = `/api/preview/html?url=${encodeURIComponent(file.url)}`;
                            window.open(previewUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          미리보기
                        </button>
                        <a
                          href={file.url}
                          download={file.name}
                          className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          다운로드
                        </a>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <a
                      key={file.id}
                      href={file.url}
                      download={file.name}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <FileIcon className="w-5 h-5 text-slate-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-slate-400" />
                    </a>
                  );
                }
              })}
            </div>
          </div>
        )}


        {/* Navigation */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex justify-center gap-6 text-sm relative z-20">
          <Link 
            href="/analytics" 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>목록으로</span>
          </Link>
        </div>
      </article>
    </div>
  );
}