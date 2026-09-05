import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketEvent } from '../types';

export function useWebSocket(onEvent?: (event: WebSocketEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      // Determine protocol and host
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // In dev mode with vite proxy, we can connect directly to backend 8000 or via proxy
      const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/events`;
      
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Start keep-alive ping
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 20000);
        (ws as any)._pingInterval = pingInterval;
      };

      ws.onmessage = (messageEvent) => {
        try {
          if (messageEvent.data === 'pong') return;
          const data: WebSocketEvent = JSON.parse(messageEvent.data);
          setLastEvent(data);
          if (onEvent) onEvent(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if ((ws as any)._pingInterval) clearInterval((ws as any)._pingInterval);
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.warn('WebSocket encountered error. Reconnecting...');
        ws.close();
      };
    } catch (e) {
      console.error('WebSocket connection initialization error:', e);
      reconnectTimeoutRef.current = setTimeout(() => connect(), 4000);
    }
  }, [onEvent]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        if ((socketRef.current as any)._pingInterval) {
          clearInterval((socketRef.current as any)._pingInterval);
        }
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastEvent };
}
