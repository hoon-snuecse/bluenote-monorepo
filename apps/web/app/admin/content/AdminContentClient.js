'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Calendar,
  Tag,
  BarChart3,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function AdminContentClient({ initialUser, initialStats, initialPosts }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('research');
  const [posts, setPosts] = useState(initialPosts?.research || []);
  const [allPosts, setAllPosts] = useState(initialPosts || {});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [stats, setStats] = useState(initialStats || {
    research: 0,
    teaching: 0,
    analytics: 0,
    shed: 0,
    total: 0
  });

  const sections = [
    { id: 'research', label: '연구', icon: BarChart3 },
    { id: 'teaching', label: '교육', icon: FileText },
    { id: 'analytics', label: '분석', icon: BarChart3 },
    { id: 'shed', label: '일상', icon: Tag }
  ];

  useEffect(() => {
    console.log('AdminContentClient mounted with:', {
      initialUser: initialUser?.email,
      isAdmin: initialUser?.isAdmin,
      statsTotal: initialStats?.total,
      postsSections: Object.keys(initialPosts || {})
    });
    
    // Always fetch from API
    fetchContent();
    
    if (!initialUser || !initialUser.isAdmin) {
      router.push('/');
      return;
    }
    
    // 초기 데이터 설정
    if (initialStats) {
      setStats(initialStats);
    }
    if (initialPosts) {
      setAllPosts(initialPosts);
      setPosts(initialPosts[activeSection] || []);
    }
  }, [initialUser, initialStats, initialPosts, router]);

  useEffect(() => {
    // 섹션 변경 시 해당 섹션의 포스트 표시
    if (allPosts[activeSection]) {
      setPosts(allPosts[activeSection]);
    }
  }, [activeSection, allPosts]);

  const fetchContent = async () => {
    try {
      console.log('Fetching content from API...');
      setLoading(true);
      const response = await fetch('/api/admin/content');
      
      console.log('Content API response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Content data fetched:', data);
        setAllPosts(data.posts || {});
        setStats(data.stats || {
          research: 0,
          teaching: 0,
          analytics: 0,
          shed: 0,
          total: 0
        });
        setPosts(data.posts?.[activeSection] || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch content:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchContent();
  };

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 콘텐츠를 삭제하시겠습니까?')) return;
    
    setLoading(true);
    try {
      const apiPath = activeSection === 'shed' 
        ? `/api/shed/posts/${id}`
        : `/api/${activeSection}/posts/${id}`;
        
      const res = await fetch(apiPath, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // 로컬 상태 업데이트
        const updatedPosts = posts.filter(p => p.id !== id);
        setPosts(updatedPosts);
        setAllPosts(prev => ({
          ...prev,
          [activeSection]: updatedPosts
        }));
        setStats(prev => ({
          ...prev,
          [activeSection]: prev[activeSection] - 1,
          total: prev.total - 1
        }));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    
    if (!confirm(`정말로 선택한 ${selectedPosts.length}개의 콘텐츠를 삭제하시겠습니까?`)) return;
    
    setLoading(true);
    try {
      const deletePromises = selectedPosts.map(id => {
        const apiPath = activeSection === 'shed' 
          ? `/api/shed/posts/${id}`
          : `/api/${activeSection}/posts/${id}`;
        return fetch(apiPath, { method: 'DELETE' });
      });

      await Promise.all(deletePromises);
      
      // 로컬 상태 업데이트
      const updatedPosts = posts.filter(p => !selectedPosts.includes(p.id));
      setPosts(updatedPosts);
      setAllPosts(prev => ({
        ...prev,
        [activeSection]: updatedPosts
      }));
      setStats(prev => ({
        ...prev,
        [activeSection]: prev[activeSection] - selectedPosts.length,
        total: prev.total - selectedPosts.length
      }));
      setSelectedPosts([]);
    } catch (error) {
      console.error('Failed to delete posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePostSelection = (id) => {
    setSelectedPosts(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  if (!initialUser || !initialUser.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mt-1.5">
        <h1 className="text-2xl font-bold text-white">콘텐츠 관리</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
          <Link
            href="/admin/dashboard"
            className="flex items-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            관리자 대시보드로
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`p-4 rounded-lg border transition-all ${
              activeSection === section.id
                ? 'bg-blue-600 border-blue-500'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <section.icon className="w-5 h-5 text-white" />
              <span className="text-2xl font-bold text-white">{stats[section.id]}</span>
            </div>
            <p className="text-sm text-slate-300">{section.label}</p>
          </button>
        ))}
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-white" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-sm text-slate-300">전체</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="제목 또는 내용으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {selectedPosts.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            선택 삭제 ({selectedPosts.length})
          </button>
        )}
      </div>

      {/* Content List */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            {searchTerm ? '검색 결과가 없습니다.' : '콘텐츠가 없습니다.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 font-medium text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts(filteredPosts.map(p => p.id));
                        } else {
                          setSelectedPosts([]);
                        }
                      }}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="text-left p-4 font-medium text-slate-300">제목</th>
                  <th className="text-left p-4 font-medium text-slate-300">작성일</th>
                  <th className="text-center p-4 font-medium text-slate-300">태그</th>
                  <th className="text-right p-4 font-medium text-slate-300">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => togglePostSelection(post.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-white">{post.title}</p>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                          {post.content?.substring(0, 100)}...
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-slate-500 text-xs">+{post.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${activeSection}/${post.id}`}
                          className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={loading}
                          className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}