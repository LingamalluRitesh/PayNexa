import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'node:http';

export interface RealtimeEventPayload<T = unknown> {
  event: 'PAYMENT_CAPTURED' | 'FRAUD_ALERT' | 'WEBHOOK_DELIVERY' | 'LEDGER_POSTED' | 'DISPUTE_EVENT';
  timestamp: string;
  data: T;
}

export class WebSocketGateway {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public init(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);

      // Send initial welcome
      ws.send(
        JSON.stringify({
          event: 'CONNECTED',
          message: 'Connected to PayNexa Realtime Event Gateway',
          timestamp: new Date().toISOString(),
        })
      );

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', () => {
        this.clients.delete(ws);
      });

      ws.on('message', (message) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          }
        } catch {
          // ignore malformed messages
        }
      });
    });
  }

  public broadcast<T>(event: RealtimeEventPayload<T>['event'], data: T): void {
    const payload: RealtimeEventPayload<T> = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const serialized = JSON.stringify(payload);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialized);
      }
    }
  }
}

export const wsGateway = new WebSocketGateway();
