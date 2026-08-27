import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { webhookDispatcher } from '../services/webhook-dispatcher.service.js';

export const webhookRouter = Router();

webhookRouter.post('/endpoints', (req: AuthenticatedRequest, res: Response) => {
  try {
    const endpoint = webhookDispatcher.registerEndpoint({
      merchantId: req.merchantId || req.body.merchantId || 'merch_demo_1',
      url: req.body.url,
      description: req.body.description,
      subscribedEvents: req.body.subscribedEvents,
    });
    res.status(201).json({ success: true, data: endpoint });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'endpoint_registration_failed', message: (err as Error).message } });
  }
});

webhookRouter.get('/endpoints', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId;
  const endpoints = webhookDispatcher.listEndpoints(merchantId);
  res.json({ success: true, data: endpoints });
});

webhookRouter.delete('/endpoints/:id', (req: AuthenticatedRequest, res: Response) => {
  const deleted = webhookDispatcher.deleteEndpoint(req.params.id);
  res.json({ success: deleted });
});

webhookRouter.get('/logs', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId;
  const logs = webhookDispatcher.listLogs(merchantId);
  res.json({ success: true, data: logs });
});

webhookRouter.post('/logs/:id/replay', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await webhookDispatcher.replayDelivery(req.params.id);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'replay_failed', message: (err as Error).message } });
  }
});

webhookRouter.post('/test-ping', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const event = await webhookDispatcher.dispatchEvent('payment_intent.succeeded', req.merchantId || 'merch_demo_1', {
      pingId: `ping_${Date.now()}`,
      message: 'PayNexa Webhook Delivery Sandbox Verification Test',
      timestamp: new Date().toISOString(),
    });
    res.json({ success: true, data: event });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'ping_failed', message: (err as Error).message } });
  }
});
