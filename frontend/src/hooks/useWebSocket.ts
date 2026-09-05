import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketEvent } from '../types';

export function useWebSocket(onEvent?: (event: WebSocketEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      // Allow custom WebSocket URL (e.g. wss://ocean-spy-buoy.onrender.com/ws/events)
      let wsUrl = import.meta.env.VITE_WS_URL;
      if (!wsUrl) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // If served from custom domain or dev server, fallback gracefully
        const host = window.location.port === '5173' ? `${window.location.hostname}:8000` : window.location.host;
        wsUrl = `${protocol}//${host}/ws/events`;
      }
      
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
