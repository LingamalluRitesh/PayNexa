import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';
import { db } from '../database/database.js';

export const paymentRouter = Router();

paymentRouter.post('/intents', (req: AuthenticatedRequest, res: Response) => {
  try {
    const intent = paymentService.createIntent({
      merchantId: req.merchantId || req.body.merchantId || 'merch_demo_1',
      amountCents: req.body.amountCents,
      currency: req.body.currency || 'USD',
      customerId: req.body.customerId,
      description: req.body.description,
      statementDescriptor: req.body.statementDescriptor,
      receiptEmail: req.body.receiptEmail,
      metadata: req.body.metadata,
      idempotencyKey: req.headers['idempotency-key'] as string | undefined,
    });

    res.status(201).json({ success: true, data: intent });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'intent_creation_failed', message: (err as Error).message } });
  }
});

paymentRouter.get('/intents', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId;
  const intents = paymentService.listIntents(merchantId);
  res.json({ success: true, data: intents });
});

paymentRouter.get('/intents/:id', (req: AuthenticatedRequest, res: Response) => {
  const intent = paymentService.getIntent(req.params.id);
  if (!intent) {
    res.status(404).json({ success: false, error: { code: 'intent_not_found', message: 'PaymentIntent not found' } });
    return;
  }
  res.json({ success: true, data: intent });
});

paymentRouter.post('/intents/:id/confirm', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await paymentService.confirmIntent(req.params.id, {
      paymentMethodType: req.body.paymentMethodType || 'CARD',
      card: req.body.card,
      upi: req.body.upi,
      bank: req.body.bank,
      ipAddress: req.ip || '127.0.0.1',
      deviceFingerprint: req.body.deviceFingerprint,
    });

    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'payment_confirmation_failed', message: (err as Error).message } });
  }
});

paymentRouter.post('/intents/:id/verify-3ds', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await paymentService.verify3DsOtp(req.params.id, req.body.otpCode);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: '3ds_verification_failed', message: (err as Error).message } });
  }
});

paymentRouter.post('/intents/:id/refund', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const refund = await paymentService.refundPayment(req.params.id, {
      amountCents: req.body.amountCents,
      reason: req.body.reason,
    });
    res.json({ success: true, data: refund });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'refund_failed', message: (err as Error).message } });
  }
});

paymentRouter.get('/charges', (req: AuthenticatedRequest, res: Response) => {
  const charges = db.table('charges').all();
  res.json({ success: true, data: charges });
});

paymentRouter.get('/refunds', (req: AuthenticatedRequest, res: Response) => {
  const refunds = db.table('refunds').all();
  res.json({ success: true, data: refunds });
});
