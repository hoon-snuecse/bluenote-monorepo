'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, Bot, User, ArrowLeft, Loader2, AlertCircle, ChevronDown, Save, CheckCircle } from 'lucide-react';
import { useSupabaseAuth } from '@bluenote/supabase-auth';

export default function ClaudeChat() {
  const { user, session, loading: authLoading } = useSupabaseAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [chatTopic, setChatTopic] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const models = [
    { 
      id: 'claude-sonnet-4-20250514', 
      name: 'Claude Sonnet 4', 
      description: '최신 - 빠르고 스마트함',
      badge: '최신',
      badgeColor: 'bg-orange-100 text-orange-700'
    },
    { 
      id: 'claude-3-5-sonnet-20241022', 
      name: 'Claude 3.5 Sonnet', 
      description: '권장 - 스마트하고 효율적',
      badge: '권장',
      badgeColor: 'bg-green-100 text-green-700'
    },
    { 
      id: 'claude-opus-4-1-20250805', 
      name: 'Claude Opus 4.1', 
      description: '최고 성능 - 복잡한 작업에 적합',
      badge: '최고 성능',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    { 
      id: 'claude-3-opus-20240229', 
      name: 'Claude 3 Opus', 
      description: '이전 버전 - 안정적인 성능',
      badge: '이전 버전',
      badgeColor: 'bg-gray-100 text-gray-700'
    },
    { 
      id: 'claude-3-5-haiku-20241022', 
      name: 'Claude 3.5 Haiku', 
      description: '빠른 응답 - 간단한 작업에 적합',
      badge: '빠름',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
  ];

  // Remove the session-check fetch since we're using useSupabaseAuth hook

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSaveChat = async () => {
    if (messages.length === 0 || saving) return;

    setSaving(true);
    try {
      // 자동 주제 생성 (첫 번째 사용자 메시지 기반)
      const firstUserMessage = messages.find(m => m.role === 'user');
      const autoTopic = chatTopic || (firstUserMessage ? 
        firstUserMessage.content.slice(0, 30).replace(/[^a-zA-Z0-9가-힣\s]/g, '').trim() : 
        'Claude와의대화'
      );

      const response = await fetch('/api/ai/chat-history/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages, 
          topic: autoTopic 
        })
      });

      if (response.ok) {
        // Download the file
        const blob = await response.blob();
        const contentDisposition = response.headers.get('content-disposition');
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : 'chat-history.md';
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`대화 저장에 실패했습니다.\n\n${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input };
    const userInput = input; // Save input before clearing
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    // Add empty assistant message that will be updated
    const assistantMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/ai/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userInput,
          model: selectedModel 
        })
      });

      if (!response.ok) {
        if (response.headers.get('content-type')?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.details || 'API request failed');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulatedText += parsed.text;
                // Update the assistant message
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[assistantMessageIndex] = {
                    role: 'assistant',
                    content: accumulatedText
                  };
                  return newMessages;
                });
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              if (data) {
                console.error('Failed to parse SSE data:', data, e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Replace the empty assistant message with error message
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[assistantMessageIndex] = {
          role: 'system',
          content: `Error: ${error.message || 'Failed to connect to Claude API'}`
        };
        return newMessages;
      });
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-4">Please login to chat with Claude.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold flex items-center">
              <Bot className="w-6 h-6 mr-2 text-purple-600" />
              Chat with Claude
            </h1>
          </div>
          
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelSelect(!showModelSelect)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Bot className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">
                {models.find(m => m.id === selectedModel)?.name || 'AI 모델 선택'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showModelSelect ? 'rotate-180' : ''}`} />
            </button>
            
            {showModelSelect && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-10 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-600">AI 모델 선택</p>
                </div>
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelSelect(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedModel === model.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{model.name}</span>
                          {model.badge && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${model.badgeColor}`}>
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{model.description}</div>
                      </div>
                      {selectedModel === model.id && (
                        <div className="ml-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Save and History Buttons */}
          {messages.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveChat}
                disabled={saving}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  saved 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>저장됨</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>저장</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 pb-[140px]">
          {messages.length === 0 ? (
            <div className="min-h-[120px] bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 mb-6 flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-10 h-10 text-purple-600 mx-auto mb-3 opacity-80" />
                <p className="text-lg font-medium text-gray-800 mb-2">
                  "인공지능의 목표는 인간의 지능을 대체하는 것이 아니라, 증강시키는 것이다"
                </p>
                <p className="text-sm text-gray-600">- 더글라스 엥겔바트</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                      {message.role === 'user' ? (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      ) : message.role === 'assistant' ? (
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.role === 'system'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="flex max-w-3xl">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-white border border-gray-200">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 bg-gradient-to-t from-white via-white to-gray-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="space-y-3"
          >
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                className="w-full px-4 py-3 pr-12 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[80px] max-h-[200px] bg-white shadow-sm"
                disabled={sending}
                rows="3"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}