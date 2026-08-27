import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { analyticsService } from '../services/analytics.service.js';

export const analyticsRouter = Router();

analyticsRouter.get('/overview', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId || 'merch_demo_1';
  const overview = analyticsService.getMerchantOverview(merchantId);
  res.json({ success: true, data: overview });
});

analyticsRouter.get('/metrics', (_req: AuthenticatedRequest, res: Response) => {
  const metrics = analyticsService.getPlatformMetrics();
  res.json({ success: true, data: metrics });
});

analyticsRouter.get('/timeseries', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId;
  const series = analyticsService.getTimeseries(merchantId);
  res.json({ success: true, data: series });
});

analyticsRouter.get('/methods', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId;
  const methods = analyticsService.getPaymentMethodBreakdown(merchantId);
  res.json({ success: true, data: methods });
});
