export type WsEventType = 'CHAT' | 'TYPING' | 'PRESENCE' | 'MESSAGE_DELETED' | 'MESSAGE_EDITED' | 'NOTIFICATION';

export interface IncomingWsPayload {
  type: WsEventType;
  content?: string | null;
}

export interface WsMessagePayload {
  type: WsEventType;
  channel_id: string;
  user_id: string;
  username: string;
  content?: string | null;
  message_id?: string | null;
  edited_content?: string | null;
}

type WsListener = (data: WsMessagePayload) => void;

class SinterWsClient {
  private socket: WebSocket | null = null;
  private channelId: string | null = null;
  private token: string | null = null;
  private listeners = new Set<WsListener>();
  private reconnectTimeout: any = null;
  private isConnecting = false;

  public get connecting() {
    return this.isConnecting;
  }

  public connect(channelId: string, token: string) {
    if (this.channelId === channelId && this.token === token && this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.disconnect();

    this.channelId = channelId;
    this.token = token;
    this.isConnecting = true;

    const wsUrl = `ws://localhost:3000/ws/channels/${channelId}?token=${encodeURIComponent(token)}`;
    console.log(`[WS] Connecting to room: ${channelId}...`);

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`[WS] Connected to room: ${channelId}`);
        this.isConnecting = false;
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data: WsMessagePayload = JSON.parse(event.data);
          this.listeners.forEach((listener) => {
            try {
              listener(data);
            } catch (err) {
              console.error('[WS] Listener error:', err);
            }
          });
        } catch (err) {
          console.error('[WS] Failed to parse message:', err, event.data);
        }
      };

      this.socket.onclose = (event) => {
        this.isConnecting = false;
        console.log(`[WS] Disconnected from room: ${channelId} (Code: ${event.code})`);
        if (this.channelId === channelId) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (err) => {
        console.error('[WS] Error in socket:', err);
        this.socket?.close();
      };
    } catch (err) {
      this.isConnecting = false;
      console.error('[WS] Connection exception:', err);
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.channelId = null;
    this.token = null;
    this.isConnecting = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }
      this.socket = null;
    }
  }

  public send(payload: IncomingWsPayload): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
      return true;
    }
    console.warn('[WS] Cannot send message, socket not open.');
    return false;
  }

  public addListener(listener: WsListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    console.log('[WS] Scheduling reconnect in 3s...');
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.channelId && this.token) {
        this.connect(this.channelId, this.token);
      }
    }, 3000);
  }
}

export const wsClient = new SinterWsClient();
