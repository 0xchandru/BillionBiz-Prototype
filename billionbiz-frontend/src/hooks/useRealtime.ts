import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getApiBaseUrl } from '../api/client';

export interface RealtimeMessage {
  id?: string;
  type: string;
  channel?: string;
  organizationId?: string;
  storeId?: string;
  aggregateType?: string;
  aggregateId?: string;
  payload?: any;
  timestamp?: string;
  cursor?: string;
}

type RealtimeFrame = {
  type?: string;
  channel?: string;
  data?: RealtimeMessage;
  events?: RealtimeMessage[];
  hasMore?: boolean;
  nextCursor?: string | null;
  timestamp?: string;
};

const CONTROL_MESSAGES = new Set([
  'connection_established',
  'subscribed',
  'pong',
  'sse_connected',
  'catchup_completed',
  'error'
]);

export function normalizeRealtimeFrame(value: unknown): RealtimeMessage[] {
  if (!value || typeof value !== 'object') return [];
  const frame = value as RealtimeFrame & RealtimeMessage;

  if (frame.type === 'event' && frame.data && typeof frame.data === 'object') {
    return [{
      ...frame.data,
      channel: frame.data.channel || frame.channel
    }];
  }

  if (frame.type === 'catchup_completed') {
    return Array.isArray(frame.events)
      ? frame.events.filter((event): event is RealtimeMessage =>
          Boolean(event && typeof event === 'object' && typeof event.type === 'string')
        )
      : [];
  }

  if (typeof frame.type !== 'string' || CONTROL_MESSAGES.has(frame.type)) return [];
  return [frame];
}

export function getRealtimeCursor(event: RealtimeMessage): string | null {
  if (event.cursor) return event.cursor;
  if (!event.timestamp || !event.id) return null;
  const timestamp = new Date(event.timestamp);
  if (!Number.isFinite(timestamp.getTime())) return null;
  return `${timestamp.toISOString()}|${event.id}`;
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
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const onEventRef = useRef(onEvent);
  const manuallyClosedRef = useRef(false);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const dispatchEvent = useCallback((event: RealtimeMessage) => {
    const nextCursor = getRealtimeCursor(event);
    if (nextCursor) cursorRef.current = nextCursor;

    setLastEvent(event);
    onEventRef.current?.(event);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('billionbiz_realtime', { detail: event }));
    }
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated || !token || manuallyClosedRef.current) return;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      const wsUrl = new URL(getRealtimeWsUrl());
      wsUrl.searchParams.set('token', token);
      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        retryCountRef.current = 0;
        // The backend reads catch-up cursors from a message, not URL params.
        const cursor = cursorRef.current || new Date(Date.now() - 60 * 60 * 1000).toISOString();
        ws.send(JSON.stringify({ action: 'catchup', cursor }));
      };

      ws.onmessage = (messageEvent) => {
        try {
          const frame = JSON.parse(messageEvent.data) as RealtimeFrame;
          if (frame.type === 'catchup_completed') {
            const events = normalizeRealtimeFrame(frame);
            for (const event of events) dispatchEvent(event);

            // Large catch-up windows are paged; continue until the server says
            // the backlog is drained. Each next cursor is timestamp + event id.
            if (frame.nextCursor) cursorRef.current = frame.nextCursor;
            if (frame.hasMore && frame.nextCursor && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ action: 'catchup', cursor: frame.nextCursor }));
            }
            return;
          }

          for (const event of normalizeRealtimeFrame(frame)) {
            dispatchEvent(event);
          }
        } catch {
          // Ignore invalid frames; the next successful catch-up repairs gaps.
        }
      };

      ws.onclose = (event: CloseEvent) => {
        setIsConnected(false);
        if (wsRef.current === ws) wsRef.current = null;
        if (manuallyClosedRef.current || event.code === 4001 || event.code === 4003) return;

        retryCountRef.current += 1;
        const baseDelay = Math.min(1000 * Math.pow(2, Math.min(retryCountRef.current, 6)), 30000);
        const jitter = Math.floor(Math.random() * 500);
        reconnectTimeoutRef.current = setTimeout(connect, baseDelay + jitter);
      };

      ws.onerror = () => {
        try { ws.close(); } catch { /* Browser owns socket cleanup. */ }
      };
    } catch {
      setIsConnected(false);
    }
  }, [dispatchEvent, isAuthenticated, token]);

  useEffect(() => {
    manuallyClosedRef.current = false;
    if (!isAuthenticated || !token) {
      setIsConnected(false);
      return;
    }

    connect();
    return () => {
      manuallyClosedRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      const socket = wsRef.current;
      wsRef.current = null;
      setIsConnected(false);
      if (socket) {
        try { socket.close(1000, 'Realtime hook unmounted'); } catch { /* Ignore close race. */ }
      }
    };
  }, [connect, isAuthenticated, token]);

  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'ping' }));
    }
  }, []);

  return {
    isConnected,
    lastEvent,
    sendPing
  };
}

export default useRealtime;
