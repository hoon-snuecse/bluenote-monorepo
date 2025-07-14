'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AIBadge from '@/components/AIBadge';

export default function ChatPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [usage, setUsage] = useState({ used: 0, limit: 0, remaining: 0 });
  const [selectedCategory, setSelectedCategory] = useState('research');
  const [blogMode, setBlogMode] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  // Fetch usage info on mount and after each message
  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/claude');
      if (res.ok) {
        const data = await res.json();
        if (data.usage) {
          setUsage(data.usage);
        }
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    
    // 사용자 메시지를 히스토리에 추가
    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          context: selectedCategory,
          blogMode: blogMode
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const assistantMessage = { 
          role: 'assistant', 
          content: data.response, 
          timestamp: new Date() 
        };
        setChatHistory(prev => [...prev, assistantMessage]);
        setResponse('');
        
        // 블로그 모드일 때 마크다운 저장
        if (blogMode) {
          setGeneratedMarkdown(data.response);
          setShowMarkdownPreview(true);
          
          // 글이 미완성인 경우 알림
          if (data.isIncomplete) {
            alert(`글이 완전히 작성되지 않았습니다. (${data.responseLength}자 작성됨)\n\n"계속 작성해줘"라고 요청하시면 이어서 작성할 수 있습니다.`);
          }
        }
        // Update usage info
        if (data.usage) {
          setUsage(data.usage);
        }
      } else {
        if (res.status === 401) {
          setResponse('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
          // 선택적: 로그인 페이지로 리다이렉트
          // window.location.href = '/auth/signin';
        } else if (res.status === 429) {
          setResponse(data.error);
          if (data.usage) {
            setUsage(data.usage);
          }
        } else {
          setResponse(`오류: ${data.error}`);
        }
      }
    } catch (error) {
      setResponse('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setResponse('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Claude AI 채팅</h1>
                <p className="text-purple-100">교육 연구와 분석에 대해 Claude와 대화해보세요</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-purple-100">오늘 사용량</p>
                  <p className="text-2xl font-bold">
                    {usage.used} / {usage.limit}
                  </p>
                  <p className="text-xs text-purple-200">
                    {usage.remaining}회 남음
                  </p>
                </div>
                <div className="flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg">
                  <AIBadge size="xlarge" />
                </div>
              </div>
            </div>
          </div>

          {/* 분류 선택 및 블로그 모드 */}
          <div className="bg-gray-100 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">분류:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="research">연구</option>
                  <option value="teaching">교육</option>
                  <option value="analytics">분석</option>
                  <option value="daily">일상</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blogMode}
                    onChange={(e) => setBlogMode(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">블로그 글 작성 모드</span>
                </label>
              </div>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="h-96 overflow-y-auto p-6 bg-gray-50 border-b">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 mt-16">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2">Claude와 연구 대화를 시작해보세요!</h3>
                <p className="text-sm">예시 질문:</p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>• "PISA 2022 결과에서 가장 주목할 만한 변화는?"</p>
                  <p>• "AI 기반 자동채점의 장단점을 분석해줘"</p>
                  <p>• "사회네트워크분석에서 중심성 지표의 의미는?"</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl px-4 py-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">
                          {msg.role === 'user' ? '👨‍🎓' : <AIBadge size="small" />}
                        </div>
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                          <p className={`text-xs mt-2 ${
                            msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {msg.timestamp.toLocaleTimeString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-lg"><AIBadge size="small" /></div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <span className="ml-2 text-gray-500 text-sm">Claude가 답변을 생성하고 있습니다...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <div className="p-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Claude에게 연구 관련 질문을 해보세요... (예: PISA 데이터 분석 방법, AI 평가 도구의 효과성 등)"
                    className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    type="submit" 
                    disabled={loading || !message.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        생성중
                      </>
                    ) : (
                      <>
                        <span>💬</span>
                        전송
                      </>
                    )}
                  </button>
                  
                  {chatHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={clearChat}
                      className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                    >
                      대화 초기화
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* 오류 메시지 */}
            {response && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">{response}</p>
              </div>
            )}

            {/* 사용 팁 */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">💡 효과적인 질문 팁</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• 구체적인 연구 주제나 데이터셋을 언급하세요</p>
                <p>• "비교 분석해줘", "장단점을 설명해줘" 등 명확한 요청을 하세요</p>
                <p>• 후속 질문으로 더 깊이 있는 대화를 이어가세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 마크다운 미리보기 모달 */}
      {showMarkdownPreview && generatedMarkdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">생성된 블로그 글</h3>
              <button
                onClick={() => setShowMarkdownPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                {generatedMarkdown}
              </pre>
            </div>
            
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedMarkdown);
                  alert('마크다운이 클립보드에 복사되었습니다!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                복사하기
              </button>
              
              <button
                onClick={async () => {
                  const filename = `${new Date().toISOString().split('T')[0]}-생성된-글.md`;
                  const res = await fetch('/api/save-blog-post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      content: generatedMarkdown,
                      filename: filename
                    })
                  });
                  
                  if (res.ok) {
                    const data = await res.json();
                    alert(`파일이 저장되었습니다: ${data.filepath}`);
                  } else {
                    alert('파일 저장에 실패했습니다.');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                파일로 저장
              </button>
              
              <button
                onClick={() => setShowMarkdownPreview(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}