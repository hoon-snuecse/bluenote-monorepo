'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function AdminContentClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('research');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [stats, setStats] = useState({
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
    if (status === 'loading') return;
    
    if (!session || !session.user.isAdmin) {
      router.push('/');
      return;
    }

    fetchPosts();
    fetchStats();
  }, [session, status, router, activeSection]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${activeSection}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsPromises = sections.map(async (section) => {
        const res = await fetch(`/api/${section.id}`);
        if (res.ok) {
          const data = await res.json();
          return { id: section.id, count: data.posts?.length || 0 };
        }
        return { id: section.id, count: 0 };
      });

      const results = await Promise.all(statsPromises);
      const newStats = { total: 0 };
      results.forEach(result => {
        newStats[result.id] = result.count;
        newStats.total += result.count;
      });
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDeletePost = async (id) => {
    if (!confirm('정말로 이 게시물을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/${activeSection}/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPosts();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedPosts.length) return;
    if (!confirm(`정말로 ${selectedPosts.length}개의 게시물을 삭제하시겠습니까?`)) return;

    try {
      await Promise.all(
        selectedPosts.map(id =>
          fetch(`/api/${activeSection}/${id}`, { method: 'DELETE' })
        )
      );
      
      setSelectedPosts([]);
      fetchPosts();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete posts:', error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session || !session.user.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">콘텐츠 관리</h1>
        <Link
          href="/admin/dashboard"
          className="flex items-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          대시보드로
        </Link>
      </div>

      {/* Stats */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">콘텐츠 현황</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const percentage = stats.total > 0 ? (stats[section.id] / stats.total * 100).toFixed(1) : 0;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`p-4 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5" />
                  <span className="text-2xl font-bold">{stats[section.id]}</span>
                </div>
                <p className="text-sm mb-1">{section.label}</p>
                <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${isActive ? 'bg-white' : 'bg-blue-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs mt-1 opacity-70">{percentage}%</p>
              </button>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
          <p className="text-slate-400">전체 콘텐츠</p>
          <p className="text-xl font-bold text-white">{stats.total || 0}개</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="제목 또는 요약으로 검색..."
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {selectedPosts.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            선택 삭제 ({selectedPosts.length})
          </button>
        )}
      </div>

      {/* Content Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(filteredPosts.map(post => post.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="p-4 text-left text-slate-300">제목</th>
                <th className="p-4 text-left text-slate-300">카테고리</th>
                <th className="p-4 text-left text-slate-300">작성일</th>
                <th className="p-4 text-left text-slate-300">태그</th>
                <th className="p-4 text-right text-slate-300">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts([...selectedPosts, post.id]);
                        } else {
                          setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-white">{post.title}</p>
                    {post.summary && (
                      <p className="text-sm text-slate-400 mt-1 line-clamp-1">{post.summary}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm">
                      {post.category || '미분류'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-slate-400 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(post.date || post.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {post.tags?.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {post.tags?.length > 3 && (
                        <span className="text-slate-500 text-xs">+{post.tags.length - 3}</span>
                      )}
                    </div>
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
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 콘텐츠가 없습니다.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}