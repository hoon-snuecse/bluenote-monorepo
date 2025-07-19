import { useEffect, useState, useCallback, useRef } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

interface EvaluationUpdate {
  type: 'connected' | 'evaluation_started' | 'evaluation_completed' | 'error';
  submissionId?: string;
  studentName?: string;
  evaluationId?: string;
  overallLevel?: string;
  timestamp?: string;
  clientId?: string;
  error?: string;
}

export function useEvaluationStream(assignmentId: string | null) {
  const [updates, setUpdates] = useState<EvaluationUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { addNotification } = useNotification();

  const connect = useCallback(() => {
    if (!assignmentId || eventSourceRef.current) return;

    const clientId = crypto.randomUUID();
    const url = `/api/evaluations/stream?assignmentId=${assignmentId}&clientId=${clientId}`;
    
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('SSE connection established');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setUpdates(prev => [...prev, data]);
        
        if (data.type === 'connected') {
          setIsConnected(true);
        } else if (data.type === 'evaluation_started') {
          addNotification({
            type: 'info',
            title: '평가 시작',
            message: `${data.studentName} 학생의 평가가 시작되었습니다.`
          });
        } else if (data.type === 'evaluation_completed') {
          addNotification({
            type: 'success',
            title: '평가 완료',
            message: `${data.studentName} 학생의 평가가 완료되었습니다.`
          });
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;

      // 재연결 시도
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect SSE...');
        connect();
      }, 5000);
    };
  }, [assignmentId, addNotification]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    updates,
    isConnected,
    clearUpdates
  };
}