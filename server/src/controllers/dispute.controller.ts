import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { disputeService } from '../services/dispute.service.js';

export const disputeRouter = Router();

disputeRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const merchantId = (req.query.merchantId as string) || req.merchantId;
  const disputes = disputeService.listDisputes(merchantId);
  res.json({ success: true, data: disputes });
});

disputeRouter.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const dispute = disputeService.getDispute(req.params.id);
  if (!dispute) {
    res.status(404).json({ success: false, error: { code: 'dispute_not_found', message: 'Dispute not found' } });
    return;
  }
  res.json({ success: true, data: dispute });
});

disputeRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const dispute = disputeService.createDispute({
      paymentIntentId: req.body.paymentIntentId,
      reason: req.body.reason || 'FRAUDULENT',
      evidence: req.body.evidence,
    });
    res.status(201).json({ success: true, data: dispute });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'dispute_creation_failed', message: (err as Error).message } });
  }
});

disputeRouter.post('/:id/evidence', (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = disputeService.submitEvidence(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'evidence_submission_failed', message: (err as Error).message } });
  }
});

disputeRouter.post('/:id/resolve', (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = disputeService.resolveDispute(req.params.id, req.body.outcome, req.body.notes);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'resolution_failed', message: (err as Error).message } });
  }
});
