'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, Bot, User, ArrowLeft, Loader2, AlertCircle, ChevronDown } from 'lucide-react';

export default function ClaudeChat() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [showModelSelect, setShowModelSelect] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const models = [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: '가장 균형잡힌 모델' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: '빠른 응답' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '가장 강력한 성능' },
  ];

  useEffect(() => {
    fetch('/api/auth/session-check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setSession(data.session);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  if (loading) {
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
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            Login
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
              <span className="text-sm font-medium">
                {models.find(m => m.id === selectedModel)?.name || 'Select Model'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showModelSelect ? 'rotate-180' : ''}`} />
            </button>
            
            {showModelSelect && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelSelect(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedModel === model.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
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

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px] max-h-[200px]"
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