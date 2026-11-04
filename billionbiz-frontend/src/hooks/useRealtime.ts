import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getApiBaseUrl } from '../api/client';

export interface RealtimeMessage {
  id?: string;
  type: string;
  channel?: string;
  aggregateType?: string;
  aggregateId?: string;
  payload?: any;
  timestamp?: string;
}

export function getRealtimeWsUrl(): string {
  const httpUrl = getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
  const isSecure = httpUrl.startsWith('https://');
  const baseWs = httpUrl.replace(/^https?:\/\//, isSecure ? 'wss://' : 'ws://');
  return `${baseWs}/realtime`;
}

export function useRealtime(onEvent?: (event: RealtimeMessage) => void) {
  const { token, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const cursorRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const onEventRef = useRef(onEvent);

  // Keep event handler reference fresh without triggering reconnects
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) return;

    // Clear existing timer
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      const wsUrl = new URL(getRealtimeWsUrl());
      wsUrl.searchParams.set('token', token);
      if (cursorRef.current) {
        wsUrl.searchParams.set('cursor', cursorRef.current);
      }

      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        retryCountRef.current = 0;
      };

      ws.onmessage = (messageEvent) => {
        try {
          const data: RealtimeMessage = JSON.parse(messageEvent.data);

          if (data.id) {
            cursorRef.current = data.id;
          }

          setLastEvent(data);
          if (onEventRef.current) {
            onEventRef.current(data);
          }

          // Dispatch window event for cross-component subscription
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('billionbiz_realtime', { detail: data }));
          }
        } catch {
          // Ignore non-json or heartbeat frames
        }
      };

      ws.onclose = (event: CloseEvent) => {
        setIsConnected(false);
        wsRef.current = null;

        // Do NOT reconnect if auth failed (4001 Unauthorized, 4003 Forbidden)
        if (event.code === 4001 || event.code === 4003) {
          return;
        }

        // Limit retries with exponential backoff (max 5 retries: 2s, 4s, 8s, 16s, 20s)
        if (retryCountRef.current < 5) {
          retryCountRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 20000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = () => {
        try {
          ws.close();
        } catch {}
      };
    } catch {
      // WebSocket initialization failure
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        const socket = wsRef.current;
        wsRef.current = null;
        if (socket.readyState === WebSocket.CONNECTING) {
          socket.onopen = () => {
            try { socket.close(); } catch {}
          };
          socket.onerror = () => {};
        } else {
          try { socket.close(); } catch {}
        }
      }
    };
  }, [connect]);

  const sendPing = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'ping' }));
    }
  }, []);

  return {
    isConnected,
    lastEvent,
    sendPing
  };
}
