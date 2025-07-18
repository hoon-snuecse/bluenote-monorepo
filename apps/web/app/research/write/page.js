'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, BarChart2, Network, Plus, Save, X, Loader2, Image as ImageIcon, Upload, FileText, Paperclip, Music, Video } from 'lucide-react';
import Link from 'next/link';
import matter from 'gray-matter';

function WritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id') || searchParams.get('edit'); // 'id' 파라미터도 지원
  
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
    { id: 'evaluation', name: '교육평가', icon: GraduationCap, desc: '평가 방법론' },
    { id: 'pisa', name: 'PISA 분석', icon: BarChart2, desc: '국제 학업성취도' },
    { id: 'sna', name: '소셜네트워크분석', icon: Network, desc: 'SNA 연구' },
    { id: 'others', name: '기타', icon: Plus, desc: '기타 연구' },
  ]);

  const loadPost = useCallback(async () => {
    try {
      const response = await fetch('/api/research/posts/supabase');
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
      const endpoint = '/api/research/posts/supabase';
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
        router.push(`/research/${editId || responseData.id}`);
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
          .from('research-images')
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
            throw new Error('Storage가 올바르게 설정되지 않았습니다. Supabase 대시보드에서 research-images 버킷을 확인해주세요.');
          } else {
            throw new Error(error.message || 'Upload failed');
          }
        }

        console.log('Image upload success:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('research-images')
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
          .from('research-images')
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
          .from('research-images')
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
            throw new Error('Storage가 올바르게 설정되지 않았습니다. Supabase 대시보드에서 research-images 버킷을 확인해주세요.');
          } else {
            throw new Error(error.message || 'Upload failed');
          }
        }

        console.log('File upload success:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('research-images')
          .getPublicUrl(filePath);

        // Add uploaded file to form data
        setFormData(prev => ({
          ...prev,
          files: [...prev.files, {
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
      console.error('File upload error:', error);
      alert(`파일 업로드 중 오류가 발생했습니다.\n\n${error.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  // Get file icon based on mime type or file name
  const getFileIcon = (file) => {
    const mimeType = file.type;
    const fileName = file.name.toLowerCase();
    
    if (mimeType?.startsWith('audio/') || fileName.endsWith('.wav') || fileName.endsWith('.mp3')) {
      return Music;
    }
    if (mimeType?.startsWith('video/') || fileName.endsWith('.mp4')) {
      return Video;
    }
    return Paperclip;
  };

  const removeFile = async (file) => {
    try {
      // If file has a path (uploaded to Supabase), delete it
      if (file.path) {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        const { error } = await supabase.storage
          .from('research-images')
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
    <div className="min-h-screen py-16 px-4">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <Link href="/research" className="text-blue-600 hover:text-blue-700 transition-colors">
            ← 연구로 돌아가기
          </Link>
        </div>

        <div className="quote-sheet">
          <div className="relative">
            <div className="absolute inset-4 border border-dashed border-blue-200 rounded-lg opacity-30"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-space-grotesk font-bold text-slate-800 mb-8">
                {editId ? '글 수정' : '새 글 작성'}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* MD File Upload */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    마크다운 파일로 불러오기 (선택사항)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors">
                      <FileText className="w-5 h-5" />
                      <span>MD 파일 선택</span>
                      <input
                        type="file"
                        accept=".md"
                        onChange={handleMdUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-slate-600">
                      외부에서 작성한 마크다운 파일을 업로드하여 내용을 자동으로 채울 수 있습니다.
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <a 
                      href="/templates/shed-post-template.md" 
                      download="blog-post-template.md"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      템플릿 다운로드
                    </a>
                    <span className="text-slate-500 mx-2">|</span>
                    <Link 
                      href="/MD_UPLOAD_GUIDE"
                      target="_blank"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      사용 가이드
                    </Link>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="글 제목을 입력하세요"
                  />
                </div>

                {/* Category */}
                <div>
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
                      onClick={() => setShowNewCategory(!showNewCategory)}
                      className="px-4 py-2 rounded-lg font-medium bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      새 카테고리
                    </button>
                  </div>

                  {showNewCategory && (
                    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                      <input
                        type="text"
                        placeholder="카테고리 ID (영문)"
                        value={newCategory.id}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z]/g, '') }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="카테고리 이름"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="설명 (선택사항)"
                        value={newCategory.desc}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, desc: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                        >
                          추가
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewCategory(false)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    요약
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows="2"
                    placeholder="글의 간단한 요약을 작성하세요"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    내용
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows="15"
                    placeholder="글 내용을 작성하세요. 마크다운 문법을 사용할 수 있습니다."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    이미지
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingImage ? (
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mb-2 text-slate-400" />
                              <p className="mb-2 text-sm text-slate-500">
                                <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
                              </p>
                              <p className="text-xs text-slate-500">PNG, JPG, GIF, WEBP (최대 10MB)</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>

                    {/* Uploaded Images */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-24 object-cover rounded-lg border border-slate-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-100 rounded-lg flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => insertImageToContent(image)}
                                className="px-2 py-1 bg-white rounded text-slate-700 hover:bg-blue-100 transition-colors flex items-center gap-1 text-xs font-medium shadow-sm"
                                title="본문에 삽입"
                              >
                                <ImageIcon className="w-4 h-4" />
                                삽입
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(image)}
                                className="px-2 py-1 bg-white rounded text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1 text-xs font-medium shadow-sm"
                                title="삭제"
                              >
                                <X className="w-4 h-4" />
                                삭제
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 truncate">{image.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload (PDF, etc.) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    첨부파일 (PDF, DOC 등)
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                        <div className="flex flex-col items-center justify-center pt-3 pb-3">
                          <Paperclip className="w-8 h-8 mb-2 text-slate-400" />
                          <p className="text-sm text-slate-500">
                            <span className="font-semibold">문서 파일 업로드</span>
                          </p>
                          <p className="text-xs text-slate-500">PDF, DOC, HTML, WAV, MP3, MP4 (최대 50MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.wav,.mp3,.mp4,.html"
                          multiple
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                        />
                      </label>
                    </div>

                    {/* Uploaded Files */}
                    {formData.files.length > 0 && (
                      <div className="space-y-2">
                        {formData.files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              {(() => {
                                const FileIcon = getFileIcon(file);
                                return <FileIcon className="w-5 h-5 text-slate-500" />;
                              })()}
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
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    태그
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="태그를 입력하고 Enter를 누르세요"
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
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
                  )}
                </div>

                {/* AI Generated Flag */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="aiGenerated"
                    checked={formData.isAIGenerated}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAIGenerated: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="aiGenerated" className="text-sm text-slate-700">
                    AI와 함께 작성한 글
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editId ? '수정 완료' : '글 발행'}
                      </>
                    )}
                  </button>
                  <Link
                    href="/research"
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
                  >
                    취소
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <WritePageContent />
    </Suspense>
  );
}