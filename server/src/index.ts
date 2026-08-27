import express from 'express';
import cors from 'cors';
import http from 'node:http';
import { config } from './config/index.js';
import { seedDatabase } from './database/seed.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { idempotencyMiddleware } from './middleware/idempotency.middleware.js';
import { rateLimiterMiddleware } from './middleware/rate-limiter.middleware.js';
import { requestLoggerMiddleware, errorMiddleware } from './middleware/error.middleware.js';
import { wsGateway } from './websocket/socket.js';

import { ledgerRouter } from './controllers/ledger.controller.js';
import { paymentRouter } from './controllers/payment.controller.js';
import { cardRouter } from './controllers/card.controller.js';
import { fraudRouter } from './controllers/fraud.controller.js';
import { webhookRouter } from './controllers/webhook.controller.js';
import { subscriptionRouter } from './controllers/subscription.controller.js';
import { disputeRouter } from './controllers/dispute.controller.js';
import { analyticsRouter } from './controllers/analytics.controller.js';
import { kycRouter } from './controllers/kyc.controller.js';
import { authRouter } from './controllers/auth.controller.js';
import { iso20022Router } from './controllers/iso20022.controller.js';
import { reconciliationRouter } from './controllers/reconciliation.controller.js';
import { amlRouter } from './controllers/aml.controller.js';
import { vaultRouter } from './controllers/vault.controller.js';

// Auto seed on boot
seedDatabase();

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
wsGateway.init(server);

// Global Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(requestLoggerMiddleware);
app.use(rateLimiterMiddleware);

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    system: 'PayNexa Core Banking & Payment Orchestration Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Authenticated & Idempotent API Routers
const api = express.Router();
api.use(authMiddleware);
api.use(idempotencyMiddleware);

api.use('/auth', authRouter);
api.use('/ledger', ledgerRouter);
api.use('/payments', paymentRouter);
api.use('/cards', cardRouter);
api.use('/fraud', fraudRouter);
api.use('/webhooks', webhookRouter);
api.use('/subscriptions', subscriptionRouter);
api.use('/disputes', disputeRouter);
api.use('/analytics', analyticsRouter);
api.use('/kyc', kycRouter);
api.use('/iso20022', iso20022Router);
api.use('/reconciliation', reconciliationRouter);
api.use('/aml', amlRouter);
api.use('/vault', vaultRouter);

app.use(config.API_PREFIX, api);

// Catch-all API 404 Handler (Always returns JSON, never HTML)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'resource_not_found',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      requestId: `req_${Date.now()}`,
    },
  });
});

// Error Handling Middleware
app.use(errorMiddleware);

// Start Server
server.listen(config.PORT, config.HOST, () => {
  console.log(`
  ══════════════════════════════════════════════════════════════════════
  💳  PayNexa — Next-Generation Digital Payment Platform & Banking Core
  ══════════════════════════════════════════════════════════════════════
  🚀  HTTP Server:  http://localhost:${config.PORT}${config.API_PREFIX}
  ⚡  WebSocket:    ws://localhost:${config.PORT}/ws
  🔒  Environment:  ${config.NODE_ENV}
  ══════════════════════════════════════════════════════════════════════
  `);
});

export default app;
