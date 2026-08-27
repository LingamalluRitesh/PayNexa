import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { fraudEngine } from '../services/fraud-engine.service.js';

export const fraudRouter = Router();

fraudRouter.get('/rules', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: fraudEngine.listRules() });
});

fraudRouter.post('/rules', (req: AuthenticatedRequest, res: Response) => {
  try {
    const rule = fraudEngine.createRule(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'rule_creation_failed', message: (err as Error).message } });
  }
});

fraudRouter.post('/rules/:id/toggle', (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = fraudEngine.toggleRule(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'rule_toggle_failed', message: (err as Error).message } });
  }
});

fraudRouter.get('/assessments', (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '50', 10);
  res.json({ success: true, data: fraudEngine.listAssessments(limit) });
});

fraudRouter.post('/evaluate', (req: AuthenticatedRequest, res: Response) => {
  try {
    const assessment = fraudEngine.evaluateTransaction(req.body);
    res.json({ success: true, data: assessment });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'evaluation_failed', message: (err as Error).message } });
  }
});

fraudRouter.get('/blacklist', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: fraudEngine.listBlacklist() });
});

fraudRouter.post('/blacklist', (req: AuthenticatedRequest, res: Response) => {
  try {
    const entry = fraudEngine.addBlacklistEntry({
      type: req.body.type,
      value: req.body.value,
      reason: req.body.reason || 'Manual compliance flag',
      addedBy: req.userId || 'admin_user',
    });
    res.status(201).json({ success: true, data: entry });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'blacklist_failed', message: (err as Error).message } });
  }
});
