'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Tag, Edit, Trash2, GraduationCap, BarChart2, Network, Plus, FileText, Download, Music, Video, Eye } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

const iconMap = {
  evaluation: GraduationCap,
  pisa: BarChart2,
  sna: Network,
  others: Plus,
};

export default function ResearchPostClient({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, status } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  
  // 세션 디버그 로그
  useEffect(() => {
    console.log('Session status:', status);
    console.log('User data:', user);
  }, [user, status]);
  
  // 임시 관리자 이메일 체크
  const adminEmails = ['hoon@snuecse.org', 'hoon@iw.es.kr', 'sociogram@gmail.com'];
  const isAdminEmail = user?.email && adminEmails.includes(user.email);
  const hasEditPermission = user?.isAdmin || user?.canWrite || isAdminEmail;

  const fetchPost = useCallback(async () => {
    try {
      // Use Supabase API
      const response = await fetch('/api/research/posts/supabase');
      if (response.ok) {
        const data = await response.json();
        const foundPost = data.posts.find(p => p.id.toString() === id.toString());
        if (foundPost) {
          console.log('Found post:', foundPost);
          console.log('Post content:', foundPost.content);
          console.log('Post images:', foundPost.images);
          setPost(foundPost);
        } else {
          router.push('/research');
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
      const response = await fetch('/api/research/posts/supabase', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      if (response.ok) {
        router.push('/research');
      } else {
        const error = await response.json();
        alert('삭제 중 오류가 발생했습니다: ' + (error.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDownload = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  const Icon = iconMap[post.category] || GraduationCap;

  return (
    <div className={`min-h-screen py-12 px-4 transition-all duration-1000 ${
      fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="container-custom max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/research"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          연구 목록으로
        </Link>

        <article className="quote-sheet">
          <div className="relative">
            <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
            
            <div className="relative z-10">
              {/* 헤더 */}
              <header className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-200 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  {(status === 'loading' ? false : hasEditPermission) && (
                    <div className="flex gap-2">
                      <Link
                        href={`/research/write?id=${id}`}
                        className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                        title="수정"
                        onClick={(e) => {
                          console.log('Edit button clicked');
                          console.log('Session status:', status);
                          console.log('User data:', user);
                          console.log('Has edit permission:', hasEditPermission);
                          // 링크는 정상적으로 작동하도록 함
                        }}
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
                </div>
                
                <h1 className="text-3xl font-bold text-slate-800 mb-4">
                  {post.title}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.createdAt ? 
                      (typeof post.createdAt === 'string' && post.createdAt.includes('오') ? 
                        post.createdAt : 
                        new Date(post.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          timeZone: 'Asia/Seoul'
                        })
                      ) : '날짜 없음'}
                  </span>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {post.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 rounded-md text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* AI 생성 표시 */}
                {post.isAIGenerated && (
                  <p className="mt-4 text-sm text-blue-600 font-sans">
                    .AI. 이 글은 AI와 함께 작성되었습니다.
                  </p>
                )}
              </header>

              {/* 요약 */}
              {post.summary && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-base text-slate-700 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              )}

              {/* 이미지 갤러리 (메인 콘텐츠 위) */}
              {post.images && post.images.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4">관련 이미지</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {post.images.map((image, index) => (
                      <div key={index} className="group relative overflow-hidden rounded-lg border border-slate-200">
                        <img
                          src={image.url}
                          alt={image.alt || `이미지 ${index + 1}`}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-white text-sm">{image.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 본문 */}
              <div className="prose prose-slate max-w-none mb-8">
                {post.content && post.content.length > 100000 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800">
                        ⚠️ 이 글은 매우 긴 내용({Math.floor(post.content.length / 1000)}KB)을 포함하고 있습니다.
                      </p>
                    </div>
                    <div 
                      className="text-slate-700 leading-relaxed space-y-4 max-h-[800px] overflow-y-auto border border-slate-200 rounded-lg p-4"
                      dangerouslySetInnerHTML={{ 
                        __html: post.content.substring(0, 50000)
                          .replace(/\[📎 ([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">📎 $1</a>')
                          .replace(/\n/g, '<br />') + '<br /><br /><p class="text-slate-500 italic">... (내용이 너무 길어 일부만 표시됩니다)</p>' 
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className="text-slate-700 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ 
                      __html: (post.content || '')
                        .replace(/\[📎 ([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">📎 $1</a>')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                )}
              </div>

              {/* 첨부파일 */}
              {post.files && post.files.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4">첨부파일</h3>
                  <div className="space-y-2">
                    {post.files.map((file, index) => {
                      const isVideo = file.type?.includes('video') || file.name?.match(/\.(mp4|avi|mov|wmv)$/i);
                      const isAudio = file.type?.includes('audio') || file.name?.match(/\.(mp3|wav|m4a)$/i);
                      const isPDF = file.type?.includes('pdf') || file.name?.endsWith('.pdf');
                      const isHTML = file.type?.includes('html') || file.name?.match(/\.(html|htm)$/i);
                      
                      let FileIcon = FileText;
                      if (isVideo) FileIcon = Video;
                      else if (isAudio) FileIcon = Music;
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <FileIcon className="w-5 h-5 text-slate-600" />
                          <a 
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            <p className="font-medium text-slate-700 hover:text-blue-600">{file.name}</p>
                            {file.size && (
                              <p className="text-sm text-slate-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </a>
                          <button
                            onClick={() => handleDownload(file.url, file.name)}
                            className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                            title="다운로드"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}