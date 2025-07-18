'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';

export default function ApiSettingsPage() {
  const [apiKeyStatus, setApiKeyStatus] = useState<'not_set' | 'set' | 'checking'>('checking');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // API 키 상태 확인
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const response = await fetch('/api/settings/api-status');
      const data = await response.json();
      setApiKeyStatus(data.claudeApiKeySet ? 'set' : 'not_set');
    } catch (error) {
      setApiKeyStatus('not_set');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">API 설정</h1>

      {/* API 키 상태 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Claude API 키 상태
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeyStatus === 'checking' ? (
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              확인 중...
            </div>
          ) : apiKeyStatus === 'set' ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              API 키가 설정되었습니다
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-5 h-5" />
                API 키가 설정되지 않았습니다
              </div>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                설정 방법 보기 {showInstructions ? '▲' : '▼'}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 설정 방법 */}
      {showInstructions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Claude API 키 설정 방법</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">1. Claude API 키 발급</h3>
              <ol className="space-y-2 text-sm text-slate-600 ml-4">
                <li>1. <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                  Anthropic Console <ExternalLink className="w-3 h-3" />
                </a>에 접속합니다</li>
                <li>2. 계정이 없다면 회원가입을 진행합니다</li>
                <li>3. API Keys 메뉴에서 새 API 키를 생성합니다</li>
                <li>4. 생성된 API 키를 안전한 곳에 복사해둡니다</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">2. 환경 변수 설정</h3>
              <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">.env 파일:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('CLAUDE_API_KEY=sk-ant-...');
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <code className="text-slate-800">CLAUDE_API_KEY=sk-ant-...</code>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                프로젝트 루트의 .env 파일을 열고 위 내용을 추가합니다.
                YOUR_CLAUDE_API_KEY_HERE를 실제 API 키로 교체하세요.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">3. 서버 재시작</h3>
              <p className="text-sm text-slate-600">
                환경 변수를 적용하려면 개발 서버를 재시작해야 합니다:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm mt-2">
                <code className="text-slate-800">npm run dev</code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API 사용량 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>API 사용 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">요금 정보</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p>• Claude 3 Sonnet: $3 / 1M 입력 토큰, $15 / 1M 출력 토큰</p>
              <p>• Claude 3 Opus: $15 / 1M 입력 토큰, $75 / 1M 출력 토큰</p>
              <p>• 예상 비용: 학급당 (24명) 약 $2-5 (Sonnet 기준)</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">사용 팁</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• 비용 효율을 위해 Claude 3 Sonnet 사용을 권장합니다</li>
              <li>• 중요한 평가에만 Opus를 선택적으로 사용하세요</li>
              <li>• API 키는 안전하게 관리하고 외부에 노출하지 마세요</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <a 
              href="https://docs.anthropic.com/claude/docs/models-overview" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1"
            >
              자세한 API 문서 보기 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}