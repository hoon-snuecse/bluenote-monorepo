'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Coffee, Hammer, Camera, Music, Film, Plane, Plus, Save, X, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import Link from 'next/link';

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
    isAIGenerated: false
  });

  const [tagInput, setTagInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categories, setCategories] = useState([
    { id: 'coffee', name: '커피', icon: Coffee, desc: '로스팅 노트' },
    { id: 'woodwork', name: '목공', icon: Hammer, desc: '작업 프로젝트' },
    { id: 'photo', name: '사진', icon: Camera, desc: '순간의 기록' },
    { id: 'music', name: '음악', icon: Music, desc: '소리의 여정' },
    { id: 'movie', name: '영화', icon: Film, desc: '시각적 서사' },
    { id: 'travel', name: '여행', icon: Plane, desc: '새로운 영감' },
  ]);

  const loadPost = useCallback(async () => {
    try {
      const response = await fetch('/api/shed/posts');
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
            isAIGenerated: post.isAIGenerated || false
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
      const endpoint = '/api/shed/posts';
      const method = editId ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        readingTime: `${Math.ceil(formData.content.length / 500)}분`
      };
      
      if (editId) {
        payload.id = editId;
      } else {
        payload.createdAt = new Date().toISOString();
      }

      // Check payload size before sending
      const payloadSize = JSON.stringify(payload).length;
      console.log(`Sending ${method} request with payload size: ${(payloadSize / 1024).toFixed(2)}KB`);
      
      if (payloadSize > 512 * 1024) { // 512KB limit
        alert(`글의 크기가 너무 큽니다 (${(payloadSize / 1024).toFixed(0)}KB).\n\n이미지를 줄이거나 내용을 줄여주세요.\n최대 크기: 512KB`);
        setLoading(false);
        return;
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
        if (responseData.warning) {
          console.warn('Warning:', responseData.warning);
        }
        router.push(`/shed/${editId || responseData.id}`);
      } else {
        throw new Error(responseData.details || responseData.error || 'Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      
      let errorMessage = '글 저장 중 오류가 발생했습니다.\n\n';
      
      if (error.message.includes('large')) {
        errorMessage += '파일 크기가 너무 큽니다. 이미지를 더 압축하거나 일부를 제거해주세요.';
      } else if (error.message.includes('Permission')) {
        errorMessage += '파일 저장 권한이 없습니다. 관리자에게 문의하세요.';
      } else if (error.message.includes('Storage full')) {
        errorMessage += '저장 공간이 부족합니다. 관리자에게 문의하세요.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
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

  const resizeImage = (file, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Try different compression levels to get under size limit
          let quality = 0.7;
          let base64 = canvas.toDataURL('image/jpeg', quality);
          
          // If still too large, reduce quality further
          while (base64.length > 300 * 1024 && quality > 0.3) { // 300KB per image max
            quality -= 0.1;
            base64 = canvas.toDataURL('image/jpeg', quality);
          }
          
          console.log(`Image compressed: ${file.name}, quality: ${quality}, size: ${(base64.length / 1024).toFixed(0)}KB`);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    const newImages = [];

    try {
      for (const file of files) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name}의 크기가 5MB를 초과합니다. 더 작은 이미지를 선택해주세요.`);
          continue;
        }

        // Resize and compress image
        const base64 = await resizeImage(file);

        newImages.push({
          id: Date.now() + Math.random(),
          name: file.name,
          data: base64,
          type: file.type
        });
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const insertImageToContent = (image) => {
    const imageMarkdown = `\n![${image.name}](${image.data})\n`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + imageMarkdown
    }));
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <Link href="/shed" className="text-blue-600 hover:text-blue-700 transition-colors">
            ← 일상으로 돌아가기
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
                              <p className="text-xs text-slate-500">PNG, JPG, GIF (최대 5MB, 자동 압축됨)</p>
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
                              src={image.data}
                              alt={image.name}
                              className="w-full h-24 object-cover rounded-lg border border-slate-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => insertImageToContent(image)}
                                className="p-1 bg-white rounded text-slate-700 hover:bg-slate-100"
                                title="본문에 삽입"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="p-1 bg-white rounded text-red-600 hover:bg-red-50"
                                title="삭제"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 truncate">{image.name}</p>
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
                    href="/shed"
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