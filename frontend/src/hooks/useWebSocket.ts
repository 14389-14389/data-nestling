import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: 'file_uploaded' | 'file_deleted' | 'file_updated' | 'stats_updated' | 'file_downloaded' | 'file_cleanup';
  file?: any;
  stats?: any;
  filename?: string;
  timestamp?: string;
}

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('🔄 WebSocket connected successfully');
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          setLastMessage(data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        if (reconnectAttempts < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`⏳ Attempting reconnect in ${delay}ms (attempt ${reconnectAttempts + 1})`);
          
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
    }
  }, [reconnectAttempts]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }, []);

  return { 
    isConnected, 
    lastMessage, 
    sendMessage,
    reconnectAttempts 
  };
};
