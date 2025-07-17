'use client';

import { useEffect, useState } from 'react';
import { Coffee, Hammer, Camera, Music, Film, Plane, Plus, PenTool, ChevronRight, Calendar, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ShedPageClient() {
  const { data: session } = useSession();
  
  const [fadeIn, setFadeIn] = useState({
    hero: false,
    content: false,
    items: false,
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'coffee', name: '커피', icon: Coffee, desc: '로스팅 노트' },
    { id: 'woodwork', name: '목공', icon: Hammer, desc: '작업 프로젝트' },
    { id: 'photo', name: '사진', icon: Camera, desc: '순간의 기록' },
    { id: 'music', name: '음악', icon: Music, desc: '소리의 여정' },
    { id: 'movie', name: '영화', icon: Film, desc: '시각적 서사' },
    { id: 'travel', name: '여행', icon: Plane, desc: '새로운 영감' },
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setFadeIn(prev => ({ ...prev, hero: true })), 100),
      setTimeout(() => setFadeIn(prev => ({ ...prev, content: true })), 500),
      setTimeout(() => setFadeIn(prev => ({ ...prev, items: true })), 700),
    ];

    // 포스트 데이터 로드
    fetchPosts();

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const fetchPosts = async () => {
    try {
      // Use Supabase API
      const response = await fetch('/api/shed/posts/supabase');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched posts data:', data); // Debug log
        setPosts(data.posts || []);
        if (data.warning) {
          console.warn('Warning:', data.warning);
        }
        // Log first post details for debugging
        if (data.posts && data.posts.length > 0) {
          console.log('First post:', data.posts[0]);
          console.log('First post tags:', data.posts[0].tags);
          console.log('First post images:', data.posts[0].images);
        }
      } else {
        console.error('API response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`py-24 px-4 text-center transition-all duration-1000 ${
        fadeIn.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="container-custom">
          <h1 className="text-5xl md:text-6xl font-space-grotesk font-bold mb-6 bg-gradient-to-br from-slate-900 to-blue-600 bg-clip-text text-transparent">
            일상
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 font-medium">
            연구실 밖의 창조적 작업들
          </p>
          
          <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
            커피, 목공, 사진, 음악, 영화, 여행 등 <strong className="text-slate-700">일상에서 찾는 영감의 순간들</strong>. 
            손으로 만들고, 직접 경험하며, 새로운 시각을 발견하는 공간입니다.
          </p>
        </div>
      </section>

      {/* Category Navigation */}
      <section className={`py-8 px-4 transition-all duration-1000 ${
        fadeIn.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="container-custom max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                전체
              </button>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
            
            {session?.user?.isAdmin && (
              <Link
                href="/shed/write"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <PenTool className="w-4 h-4" />
                글쓰기
              </Link>
            )}
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const category = categories.find(c => c.id === post.category);
                const Icon = category?.icon || Coffee;
                
                return (
                  <Link
                    key={post.id}
                    href={`/shed/${post.id}`}
                    className="quote-sheet hover:shadow-lg transition-all group relative z-10 block"
                    onClick={() => console.log('Clicked post:', post.id, post.title)}
                  >
                    <div className="relative">
                      <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-200 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-sm text-slate-500">
                            {post.createdAt ? 
                              (typeof post.createdAt === 'string' && post.createdAt.includes('오') ? 
                                post.createdAt : 
                                new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'numeric',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Asia/Seoul'
                                })
                              ) : '날짜 없음'}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-base text-slate-600 mb-4 line-clamp-3">
                          {post.summary}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <div className="flex items-center gap-4">
                            {post.tags && post.tags.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {post.tags[0]}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="quote-sheet max-w-2xl mx-auto text-center">
              <div className="relative">
                <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
                
                <div className="relative z-10 py-12">
                  <p className="text-lg text-slate-600 mb-4">
                    {selectedCategory === 'all' 
                      ? '아직 작성된 글이 없습니다.'
                      : `${categories.find(c => c.id === selectedCategory)?.name} 카테고리에 글이 없습니다.`}
                  </p>
                  {session?.user?.isAdmin && (
                    <Link
                      href="/shed/write"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <PenTool className="w-4 h-4" />
                      첫 글을 작성해보세요
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}