import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';

interface ChatMessage {
  type: 'message' | 'user_joined' | 'user_left' | 'connected';
  user?: {
    id: string;
    name: string;
  };
  message?: string;
  timestamp?: string;
  clientId?: string;
}

export function useChat(assignmentId: string | null) {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!assignmentId || !user || eventSourceRef.current) return;

    const url = `/api/chat?assignmentId=${assignmentId}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ChatMessage = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          setIsConnected(true);
          if (data.user) {
            setOnlineUsers(prev => new Set([...prev, data.user!.id]));
          }
        } else if (data.type === 'user_joined') {
          setMessages(prev => [...prev, data]);
          if (data.user) {
            setOnlineUsers(prev => new Set([...prev, data.user!.id]));
          }
        } else if (data.type === 'user_left') {
          setMessages(prev => [...prev, data]);
          if (data.user) {
            setOnlineUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.user!.id);
              return newSet;
            });
          }
        } else if (data.type === 'message') {
          setMessages(prev => [...prev, data]);
        }
      } catch (error) {
        console.error('Failed to parse chat message:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;
      
      // Retry connection after 5 seconds
      setTimeout(() => {
        connect();
      }, 5000);
    };
  }, [assignmentId, user]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setOnlineUsers(new Set());
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!assignmentId || !message.trim()) return;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          message: message.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [assignmentId]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    messages,
    isConnected,
    onlineUsers,
    sendMessage
  };
}