import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { subscriptionService } from '../services/subscription.service.js';

export const subscriptionRouter = Router();

subscriptionRouter.get('/plans', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId;
  const plans = subscriptionService.listPlans(merchantId);
  res.json({ success: true, data: plans });
});

subscriptionRouter.post('/plans', (req: AuthenticatedRequest, res: Response) => {
  try {
    const plan = subscriptionService.createPlan({
      merchantId: req.merchantId || req.body.merchantId || 'merch_demo_1',
      name: req.body.name,
      description: req.body.description,
      amountCents: req.body.amountCents,
      currency: req.body.currency || 'USD',
      interval: req.body.interval || 'MONTH',
      intervalCount: req.body.intervalCount || 1,
      trialPeriodDays: req.body.trialPeriodDays || 0,
    });
    res.status(201).json({ success: true, data: plan });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'plan_creation_failed', message: (err as Error).message } });
  }
});

subscriptionRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId;
  const subs = subscriptionService.listSubscriptions(merchantId);
  res.json({ success: true, data: subs });
});

subscriptionRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const sub = subscriptionService.createSubscription({
      merchantId: req.merchantId || req.body.merchantId || 'merch_demo_1',
      customerId: req.body.customerId || 'cust_sarah_connor',
      planId: req.body.planId,
      defaultPaymentMethodId: req.body.defaultPaymentMethodId,
    });
    res.status(201).json({ success: true, data: sub });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'subscription_failed', message: (err as Error).message } });
  }
});

subscriptionRouter.post('/:id/cancel', (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = subscriptionService.cancelSubscription(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'cancel_failed', message: (err as Error).message } });
  }
});

subscriptionRouter.get('/invoices', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId;
  const invoices = subscriptionService.listInvoices(merchantId);
  res.json({ success: true, data: invoices });
});
