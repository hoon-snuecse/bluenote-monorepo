'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Tag, Edit, Trash2, BarChart2, Network, Plus, FileText, Download, Music, Video, Eye } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';

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
  
  const { user } = useAuth();
  
  // 임시 관리자 이메일 체크
  const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
  const isAdminEmail = user?.email && adminEmails.includes(user.email);
  const hasEditPermission = user?.isAdmin || user?.canWrite || isAdminEmail;

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
      const response = await fetch('/api/analytics/posts/supabase', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      if (response.ok) {
        router.push('/analytics');
      } else {
        const error = await response.json();
        alert('삭제 중 오류가 발생했습니다: ' + (error.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('삭제 중 오류가 발생했습니다.');
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
          <p className="mt-4 text-sm text-blue-600 font-sans">
            .AI. 이 글은 AI와 함께 작성되었습니다.
          </p>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Files Section */}
        {post.files && post.files.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">첨부 파일</h3>
            <div className="space-y-2">
              {post.files.map((file) => {
                const FileIcon = getFileIcon(file.type);
                const isHTML = file.type?.includes('html') || file.name?.match(/\.(html|htm)$/i);
                
                // Use viewer for HTML files
                const fileUrl = isHTML 
                  ? `/viewer/html?url=${encodeURIComponent(file.url)}&title=${encodeURIComponent(file.name)}`
                  : file.url;
                const linkTarget = isHTML ? '_self' : '_blank';
                
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <FileIcon className="w-5 h-5 text-slate-500" />
                    <a 
                      href={fileUrl}
                      target={linkTarget}
                      rel="noopener noreferrer"
                      className="flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-700 hover:text-blue-600">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                      </p>
                    </a>
                    <a
                      href={file.url}
                      download={file.name}
                      className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                      title="다운로드"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                );
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