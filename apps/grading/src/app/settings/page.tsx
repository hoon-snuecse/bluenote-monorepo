'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Settings, Key, FileText, Save, Plus, Trash2, Edit2, School } from 'lucide-react';

interface EvaluationTemplate {
  id: string;
  name: string;
  writingType: string;
  gradeLevel: string;
  evaluationDomains: string[];
  evaluationLevels: string[];
  criteriaTemplate: string;
}

interface SystemSettings {
  apiKeys: {
    claudeApiKey?: string;
    openaiApiKey?: string;
  };
  schoolInfo: {
    schoolName: string;
    defaultGrade: string;
  };
  evaluationDefaults: {
    defaultLevelCount: number;
    defaultDomains: string[];
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'templates' | 'api'>('general');
  const [settings, setSettings] = useState<SystemSettings>({
    apiKeys: {},
    schoolInfo: {
      schoolName: '',
      defaultGrade: ''
    },
    evaluationDefaults: {
      defaultLevelCount: 4,
      defaultDomains: []
    }
  });
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EvaluationTemplate | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    loadTemplates();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('설정 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        alert('설정이 저장되었습니다.');
      } else {
        alert('설정 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    }
  };

  const saveTemplate = async () => {
    if (!editingTemplate) return;
    
    try {
      const response = await fetch('/api/templates', {
        method: editingTemplate.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTemplate),
      });
      
      if (response.ok) {
        alert('템플릿이 저장되었습니다.');
        loadTemplates();
        setShowTemplateForm(false);
        setEditingTemplate(null);
      } else {
        alert('템플릿 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      alert('템플릿 저장 중 오류가 발생했습니다.');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('정말로 이 템플릿을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('템플릿이 삭제되었습니다.');
        loadTemplates();
      } else {
        alert('템플릿 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('템플릿 삭제 오류:', error);
      alert('템플릿 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/assignments')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            과제 목록으로 돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-900">시스템 설정</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/50 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'general'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            일반 설정
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'templates'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            평가 템플릿
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'api'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            API 설정
          </button>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5" />
                일반 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  학교명
                </label>
                <input
                  type="text"
                  value={settings.schoolInfo.schoolName}
                  onChange={(e) => setSettings({
                    ...settings,
                    schoolInfo: { ...settings.schoolInfo, schoolName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="학교명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  기본 학년
                </label>
                <select
                  value={settings.schoolInfo.defaultGrade}
                  onChange={(e) => setSettings({
                    ...settings,
                    schoolInfo: { ...settings.schoolInfo, defaultGrade: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  <option value="초등학교 1학년">초등학교 1학년</option>
                  <option value="초등학교 2학년">초등학교 2학년</option>
                  <option value="초등학교 3학년">초등학교 3학년</option>
                  <option value="초등학교 4학년">초등학교 4학년</option>
                  <option value="초등학교 5학년">초등학교 5학년</option>
                  <option value="초등학교 6학년">초등학교 6학년</option>
                  <option value="중학교 1학년">중학교 1학년</option>
                  <option value="중학교 2학년">중학교 2학년</option>
                  <option value="중학교 3학년">중학교 3학년</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  기본 평가 단계 수
                </label>
                <select
                  value={settings.evaluationDefaults.defaultLevelCount}
                  onChange={(e) => setSettings({
                    ...settings,
                    evaluationDefaults: {
                      ...settings.evaluationDefaults,
                      defaultLevelCount: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="3">3단계</option>
                  <option value="4">4단계</option>
                  <option value="5">5단계</option>
                </select>
              </div>

              <button
                onClick={saveSettings}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                설정 저장
              </button>
            </CardContent>
          </Card>
        )}

        {/* Templates */}
        {activeTab === 'templates' && (
          <>
            <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    평가 템플릿 관리
                  </CardTitle>
                  <button
                    onClick={() => {
                      setEditingTemplate({
                        id: '',
                        name: '',
                        writingType: '',
                        gradeLevel: '',
                        evaluationDomains: [''],
                        evaluationLevels: [''],
                        criteriaTemplate: ''
                      });
                      setShowTemplateForm(true);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    새 템플릿
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-slate-900">{template.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {template.writingType} · {template.gradeLevel}
                          </p>
                          <p className="text-sm text-slate-500 mt-2">
                            평가 영역: {template.evaluationDomains.join(', ')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingTemplate(template);
                              setShowTemplateForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Template Form */}
            {showTemplateForm && editingTemplate && (
              <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                <CardHeader>
                  <CardTitle>
                    {editingTemplate.id ? '템플릿 수정' : '새 템플릿 만들기'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      템플릿 이름
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        name: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 초등 5학년 논설문 평가"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        글의 종류
                      </label>
                      <select
                        value={editingTemplate.writingType}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          writingType: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">선택하세요</option>
                        <option value="논설문">논설문</option>
                        <option value="설명문">설명문</option>
                        <option value="성찰문">성찰문</option>
                        <option value="창의적 글쓰기">창의적 글쓰기</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        대상 학년
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.gradeLevel}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          gradeLevel: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="예: 초등학교 5학년"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      평가 기준 템플릿
                    </label>
                    <textarea
                      value={editingTemplate.criteriaTemplate}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        criteriaTemplate: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                      placeholder="평가 기준을 입력하세요..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveTemplate}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setShowTemplateForm(false);
                        setEditingTemplate(null);
                      }}
                      className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* API Settings */}
        {activeTab === 'api' && (
          <div className="flex items-center justify-center py-16">
            <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  API 설정은 환경 변수를 통해 관리됩니다.
                </p>
                <button
                  onClick={() => router.push('/settings/api')}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="w-5 h-5" />
                  API 설정 페이지로 이동
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}