'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { Send, Users, MessageCircle, X } from 'lucide-react';

interface ChatPanelProps {
  assignmentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ assignmentId, isOpen, onClose }: ChatPanelProps) {
  const { user } = useUser();
  const { messages, isConnected, onlineUsers, sendMessage } = useChat(assignmentId);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] z-50">
      <Card className="h-full flex flex-col bg-white shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <CardTitle className="text-lg">실시간 채팅</CardTitle>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <Users className="w-4 h-4" />
            <span>{onlineUsers.size}명 온라인</span>
            {isConnected ? (
              <span className="ml-auto text-green-200">● 연결됨</span>
            ) : (
              <span className="ml-auto text-red-200">● 연결 끊김</span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => {
            if (msg.type === 'user_joined') {
              return (
                <div key={index} className="text-center text-sm text-gray-500">
                  {msg.user?.name}님이 입장했습니다.
                </div>
              );
            }
            
            if (msg.type === 'user_left') {
              return (
                <div key={index} className="text-center text-sm text-gray-500">
                  {msg.user?.name}님이 퇴장했습니다.
                </div>
              );
            }
            
            if (msg.type === 'message') {
              const isOwnMessage = msg.user?.id === user?.id;
              return (
                <div
                  key={index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className="text-xs font-semibold mb-1 opacity-70">
                        {msg.user?.name}
                      </div>
                    )}
                    <div className="break-words">{msg.message}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString('ko-KR')}
                    </div>
                  </div>
                </div>
              );
            }
            
            return null;
          })}
          <div ref={messagesEndRef} />
        </CardContent>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}