'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart2, Network, Plus, Save, X, Loader2, Image as ImageIcon, Upload, FileText, Paperclip, Music, Video } from 'lucide-react';
import Link from 'next/link';
import matter from 'gray-matter';

function WritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [loading, setLoading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ id: '', name: '', desc: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    summary: '',
    tags: [],
    images: [],
    files: [],
    isAIGenerated: false
  });

  const [tagInput, setTagInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [categories, setCategories] = useState([
    { id: 'pisa', name: 'PISA 데이터 분석', icon: BarChart2, desc: 'PISA 분석' },
    { id: 'sna', name: '소셜네트워크 데이터분석', icon: Network, desc: 'SNA 분석' },
    { id: 'others', name: '기타', icon: Plus, desc: '기타 분석' },
  ]);

  const loadPost = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/posts/supabase');
      if (response.ok) {
        const data = await response.json();
        const post = data.posts.find(p => p.id === editId);
        if (post) {
          setFormData({
            title: post.title || '',
            category: post.category || '',
            content: post.content || '',
            summary: post.summary || '',
            tags: post.tags || [],
            images: post.images || [],
            files: post.files || [],
            isAIGenerated: post.is_ai_generated || false
          });
          
          // Check if category exists, if not add it as custom
          const categoryExists = categories.some(cat => cat.id === post.category);
          if (!categoryExists && post.category) {
            setCategories(prev => [...prev, {
              id: post.category,
              name: post.category,
              icon: Plus,
              desc: 'Custom category'
            }]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    }
  }, [editId, categories]);

  // Load post data if editing
  useEffect(() => {
    if (editId) {
      loadPost();
    }
  }, [editId, loadPost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.content) {
      alert('제목, 카테고리, 내용을 모두 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = '/api/analytics/posts/supabase';
      const method = editId ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        readingTime: `${Math.ceil(formData.content.length / 500)}분`,
        images: formData.images.map(img => ({
          path: img.path,
          name: img.name,
          size: img.size,
          type: img.type
        })),
        files: formData.files.map(file => ({
          path: file.path,
          name: file.name,
          size: file.size,
          type: file.type
        }))
      };
      
      // Debug log
      console.log('Sending payload:', {
        tags: payload.tags,
        tagsType: Array.isArray(payload.tags) ? 'array' : typeof payload.tags,
        images: payload.images.length
      });
      
      if (editId) {
        payload.id = editId;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      
      if (response.ok) {
        router.push(`/analytics/${editId || responseData.id}`);
      } else {
        throw new Error(responseData.details || responseData.error || 'Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert(`글 저장 중 오류가 발생했습니다.\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.id && newCategory.name) {
      setCategories(prev => [...prev, { ...newCategory, icon: Plus }]);
      setFormData(prev => ({ ...prev, category: newCategory.id }));
      setNewCategory({ id: '', name: '', desc: '' });
      setShowNewCategory(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);

    try {
      // Import Supabase client
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      for (const file of files) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name}의 크기가 10MB를 초과합니다. 더 작은 이미지를 선택해주세요.`);
          continue;
        }

        // Generate unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `temp/images/${fileName}`;

        // Upload directly to Supabase Storage
        const { data, error } = await supabase.storage
          .from('analytics-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Image upload error:', error);
          
          // More specific error messages
          if (error.message?.includes('row too large')) {
            throw new Error(`파일 크기가 너무 큽니다. 10MB 이하의 이미지를 선택해주세요.`);
          } else if (error.message?.includes('Invalid MIME type') || error.message?.includes('mime')) {
            throw new Error(`지원하지 않는 이미지 형식입니다. (${file.type || '알 수 없음'})`);
          } else if (error.message?.includes('bucket') || error.message?.includes('not found')) {
            throw new Error('Storage가 올바르게 설정되지 않았습니다. Supabase 대시보드에서 analytics-images 버킷을 확인해주세요.');
          } else {
            throw new Error(error.message || 'Upload failed');
          }
        }

        console.log('Image upload success:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('analytics-images')
          .getPublicUrl(filePath);

        // Add uploaded image to form data
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            id: Date.now() + Math.random(),
            name: file.name,
            url: publicUrl,
            path: filePath,
            size: file.size,
            type: file.type
          }]
        }));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert(`이미지 업로드 중 오류가 발생했습니다.\n\n${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = async (image) => {
    try {
      // If image has a path (uploaded to Supabase), delete it
      if (image.path) {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        const { error } = await supabase.storage
          .from('analytics-images')
          .remove([image.path]);
          
        if (error) {
          console.error('Error deleting image:', error);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== image.id)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
      alert('이미지 삭제 중 오류가 발생했습니다.');
    }
  };

  const insertImageToContent = (image) => {
    // Get the current cursor position or insert at the end
    const textarea = document.querySelector('textarea[name="content"]');
    const cursorPos = textarea?.selectionStart || formData.content.length;
    
    const imageMarkdown = `\n![${image.name}](${image.url})\n`;
    
    // Insert at cursor position
    const newContent = 
      formData.content.slice(0, cursorPos) + 
      imageMarkdown + 
      formData.content.slice(cursorPos);
    
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
    
    // Set cursor position after the inserted image
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(
          cursorPos + imageMarkdown.length, 
          cursorPos + imageMarkdown.length
        );
      }
    }, 0);
  };

  const handleMdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.md')) {
      alert('마크다운(.md) 파일을 선택해주세요.');
      return;
    }

    try {
      const text = await file.text();
      const { data, content } = matter(text);

      // Update form with parsed data
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        category: data.category || prev.category,
        content: content || prev.content,
        summary: data.summary || prev.summary,
        tags: data.tags || prev.tags,
        isAIGenerated: data.isAIGenerated !== undefined ? data.isAIGenerated : prev.isAIGenerated
      }));

      // Check if category exists, if not add it as custom
      if (data.category && !categories.some(cat => cat.id === data.category)) {
        setCategories(prev => [...prev, {
          id: data.category,
          name: data.category,
          icon: Plus,
          desc: 'Imported category'
        }]);
      }

      // Handle images if present in front matter
      if (data.images && Array.isArray(data.images)) {
        alert('이미지 정보가 포함되어 있습니다. 이미지 파일은 별도로 업로드해주세요.');
      }

      alert('마크다운 파일을 성공적으로 불러왔습니다.');
    } catch (error) {
      console.error('Error parsing markdown file:', error);
      alert('마크다운 파일을 읽는 중 오류가 발생했습니다.');
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFile(true);

    try {
      // Import Supabase client
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      for (const file of files) {
        // Check file size (50MB limit - Supabase free tier)
        if (file.size > 50 * 1024 * 1024) {
          alert(`${file.name}의 크기가 50MB를 초과합니다. 더 작은 파일을 선택해주세요.\n(Supabase 무료 플랜 제한)`);
          continue;
        }

        // Generate unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `temp/documents/${fileName}`;

        // Upload directly to Supabase Storage
        const { data, error } = await supabase.storage
          .from('analytics-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('File upload error:', error);
          
          // More specific error messages
          if (error.message?.includes('row too large')) {
            throw new Error(`파일 크기가 너무 큽니다. 50MB 이하의 파일을 선택해주세요.`);
          } else if (error.message?.includes('Invalid MIME type') || error.message?.includes('mime')) {
            throw new Error(`지원하지 않는 파일 형식입니다. (${file.type || '알 수 없음'})\n현재 지원: PDF, DOC, HTML, WAV, MP3, MP4`);
          } else if (error.message?.includes('bucket') || error.message?.includes('not found')) {
            throw new Error('Storage가 올바르게 설정되지 않았습니다. Supabase 대시보드에서 analytics-images 버킷을 확인해주세요.');
          } else {
            throw new Error(error.message || 'Upload failed');
          }
        }

        console.log('File upload success:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('analytics-images')
          .getPublicUrl(filePath);

        // Determine icon based on file type
        let icon = FileText;
        if (file.type.startsWith('audio/')) icon = Music;
        else if (file.type.startsWith('video/')) icon = Video;
        else if (file.type.includes('pdf')) icon = FileText;

        // Add uploaded file to form data
        setFormData(prev => ({
          ...prev,
          files: [...prev.files, {
            id: Date.now() + Math.random(),
            name: file.name,
            url: publicUrl,
            path: filePath,
            size: file.size,
            type: file.type,
            icon: icon
          }]
        }));
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert(`파일 업로드 중 오류가 발생했습니다.\n\n${error.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const removeFile = async (file) => {
    try {
      // If file has a path (uploaded to Supabase), delete it
      if (file.path) {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        const { error } = await supabase.storage
          .from('analytics-images')
          .remove([file.path]);
          
        if (error) {
          console.error('Error deleting file:', error);
        }
      }

      setFormData(prev => ({
        ...prev,
        files: prev.files.filter(f => f.id !== file.id)
      }));
    } catch (error) {
      console.error('Error removing file:', error);
      alert('파일 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">분석 포스트 작성</h1>
          <Link
            href="/analytics"
            className="text-slate-600 hover:text-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </Link>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            제목
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="포스트 제목을 입력하세요"
            required
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            카테고리
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    formData.category === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowNewCategory(true)}
              className="px-4 py-2 rounded-lg font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all"
            >
              + 새 카테고리
            </button>
          </div>
          
          {showNewCategory && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="카테고리 ID (영문)"
                  value={newCategory.id}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, id: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="카테고리 이름"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    추가
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            요약
          </label>
          <input
            type="text"
            name="summary"
            value={formData.summary}
            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="포스트를 간단히 요약해주세요 (선택사항)"
          />
        </div>

        {/* Upload MD File */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            마크다운 파일 업로드
          </label>
          <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
            <Upload className="w-5 h-5 text-slate-500" />
            <span className="text-slate-600">마크다운 파일을 선택하거나 드래그하세요</span>
            <input
              type="file"
              accept=".md"
              onChange={handleMdUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            내용
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            rows={20}
            placeholder="마크다운 형식으로 내용을 작성하세요..."
            required
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            이미지 업로드
          </label>
          <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
            <ImageIcon className="w-5 h-5 text-slate-500" />
            <span className="text-slate-600">
              {uploadingImage ? '업로드 중...' : '이미지를 선택하거나 드래그하세요 (최대 10MB)'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
          
          {/* Uploaded Images */}
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => insertImageToContent(image)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      본문에 삽입
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 truncate">{image.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            파일 첨부
          </label>
          <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
            <Paperclip className="w-5 h-5 text-slate-500" />
            <span className="text-slate-600">
              {uploadingFile ? '업로드 중...' : 'PDF, DOC, HTML, MP3, MP4 등 파일 선택 (최대 50MB)'}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.wav,.mp3,.mp4,.html"
              multiple
              onChange={handleFileUpload}
              disabled={uploadingFile}
              className="hidden"
            />
          </label>
          
          {/* Uploaded Files */}
          {formData.files.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.files.map((file) => {
                const Icon = file.icon || FileText;
                return (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            태그
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="태그를 입력하고 Enter를 누르세요"
          />
        </div>

        {/* AI Generated Checkbox */}
        <div className="mb-8">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isAIGenerated}
              onChange={(e) => setFormData(prev => ({ ...prev, isAIGenerated: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">AI로 생성된 콘텐츠</span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {editId ? '수정하기' : '발행하기'}
              </>
            )}
          </button>
          <Link
            href="/analytics"
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function AnalyticsWritePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WritePageContent />
    </Suspense>
  );
}