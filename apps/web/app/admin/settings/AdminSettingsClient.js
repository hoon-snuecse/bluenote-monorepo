'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Globe, 
  Bot, 
  FileText,
  Shield,
  Database,
  Save,
  ArrowLeft,
  AlertCircle,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState({
    // 사이트 기본 정보
    siteName: 'BlueNote Atelier',
    siteDescription: '박교수의 연구실 - 교육과 연구의 공간',
    adminEmail: 'admin@bluenote.site',
    
    // Claude AI 설정
    claudeEnabled: true,
    claudeDefaultDailyLimit: 10,
    claudeSystemPrompt: '당신은 교육과 연구를 돕는 AI 어시스턴트입니다.',
    claudeModel: 'claude-3-sonnet-20240229',
    
    // 콘텐츠 설정
    postsPerPage: 12,
    enableComments: false,
    enableSearch: true,
    defaultCategories: ['일반', '공지사항', '연구노트', '강의자료'],
    
    // 보안 설정
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5,
    enableIPWhitelist: false,
    ipWhitelist: [],
    
    // 백업 및 유지보수
    autoBackup: true,
    backupFrequency: 'daily',
    logRetentionDays: 30,
    enableMaintenanceMode: false
  });

  const tabs = [
    { id: 'general', label: '기본 정보', icon: Globe },
    { id: 'claude', label: 'Claude AI', icon: Bot },
    { id: 'content', label: '콘텐츠', icon: FileText },
    { id: 'security', label: '보안', icon: Shield },
    { id: 'maintenance', label: '유지보수', icon: Database }
  ];

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.user.isAdmin) {
      router.push('/');
      return;
    }

    // 실제로는 API에서 설정을 가져와야 함
    setLoading(false);
  }, [session, status, router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // 실제로는 API로 설정을 저장해야 함
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      
      setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
    } catch (error) {
      setMessage({ type: 'error', text: '설정 저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-white">시스템 설정</h1>
        <Link
          href="/admin/dashboard"
          className="flex items-center text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          대시보드로
        </Link>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-900/20 border border-green-800 text-green-400' 
            : 'bg-red-900/20 border border-red-800 text-red-400'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">사이트 기본 정보</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">사이트 이름</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">사이트 설명</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">관리자 이메일</label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Claude AI Settings */}
            {activeTab === 'claude' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Claude AI 설정</h3>
                
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.claudeEnabled}
                      onChange={(e) => setSettings({ ...settings, claudeEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-300">Claude AI 활성화</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">기본 일일 사용 한도</label>
                  <input
                    type="number"
                    value={settings.claudeDefaultDailyLimit}
                    onChange={(e) => setSettings({ ...settings, claudeDefaultDailyLimit: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">시스템 프롬프트</label>
                  <textarea
                    value={settings.claudeSystemPrompt}
                    onChange={(e) => setSettings({ ...settings, claudeSystemPrompt: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Claude 모델</label>
                  <select
                    value={settings.claudeModel}
                    onChange={(e) => setSettings({ ...settings, claudeModel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  </select>
                </div>
              </div>
            )}

            {/* Content Settings */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">콘텐츠 설정</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">페이지당 게시물 수</label>
                  <input
                    type="number"
                    value={settings.postsPerPage}
                    onChange={(e) => setSettings({ ...settings, postsPerPage: parseInt(e.target.value) || 10 })}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableComments}
                      onChange={(e) => setSettings({ ...settings, enableComments: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-300">댓글 기능 활성화</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSearch}
                      onChange={(e) => setSettings({ ...settings, enableSearch: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-300">검색 기능 활성화</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">기본 카테고리</label>
                  <div className="space-y-2">
                    {settings.defaultCategories.map((category, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => {
                            const newCategories = [...settings.defaultCategories];
                            newCategories[index] = e.target.value;
                            setSettings({ ...settings, defaultCategories: newCategories });
                          }}
                          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            const newCategories = settings.defaultCategories.filter((_, i) => i !== index);
                            setSettings({ ...settings, defaultCategories: newCategories });
                          }}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setSettings({ ...settings, defaultCategories: [...settings.defaultCategories, ''] });
                      }}
                      className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      카테고리 추가
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">보안 설정</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">세션 만료 시간 (시간)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 24 })}
                    min="1"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">최대 로그인 시도 횟수</label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                    min="1"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={settings.enableIPWhitelist}
                      onChange={(e) => setSettings({ ...settings, enableIPWhitelist: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-300">IP 화이트리스트 활성화</span>
                  </label>
                  
                  {settings.enableIPWhitelist && (
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-sm text-slate-400 mb-2">허용된 IP 주소 (한 줄에 하나씩)</p>
                      <textarea
                        value={settings.ipWhitelist.join('\n')}
                        onChange={(e) => setSettings({ ...settings, ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) })}
                        rows="4"
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="192.168.1.1&#10;10.0.0.0/24"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Maintenance Settings */}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">백업 및 유지보수</h3>
                
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={settings.autoBackup}
                      onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-300">자동 백업 활성화</span>
                  </label>
                  
                  {settings.autoBackup && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">백업 주기</label>
                      <select
                        value={settings.backupFrequency}
                        onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">매일</option>
                        <option value="weekly">매주</option>
                        <option value="monthly">매월</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">로그 보관 기간 (일)</label>
                  <input
                    type="number"
                    value={settings.logRetentionDays}
                    onChange={(e) => setSettings({ ...settings, logRetentionDays: parseInt(e.target.value) || 30 })}
                    min="1"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableMaintenanceMode}
                      onChange={(e) => setSettings({ ...settings, enableMaintenanceMode: e.target.checked })}
                      className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-red-400">유지보수 모드 활성화</span>
                  </label>
                  <p className="text-xs text-red-400 mt-2">
                    유지보수 모드가 활성화되면 관리자를 제외한 모든 사용자의 접근이 차단됩니다.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">시스템 상태</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">마지막 백업</p>
                      <p className="text-white">2024-01-20 03:00</p>
                    </div>
                    <div>
                      <p className="text-slate-400">데이터베이스 크기</p>
                      <p className="text-white">256 MB</p>
                    </div>
                    <div>
                      <p className="text-slate-400">로그 파일 크기</p>
                      <p className="text-white">32 MB</p>
                    </div>
                    <div>
                      <p className="text-slate-400">캐시 크기</p>
                      <p className="text-white">128 MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 pt-6 border-t border-slate-700 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? '저장 중...' : '설정 저장'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}