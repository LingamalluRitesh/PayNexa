import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { kycService } from '../services/kyc.service.js';

export const kycRouter = Router();

kycRouter.get('/', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: kycService.listVerifications() });
});

kycRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const kyc = kycService.submitVerification({
      userId: req.body.userId || req.userId || 'usr_alex_chen',
      merchantId: req.body.merchantId || req.merchantId,
      documentType: req.body.documentType || 'PASSPORT',
      documentNumber: req.body.documentNumber || 'A98765432',
      fullName: req.body.fullName || 'Alex Chen',
      dateOfBirth: req.body.dateOfBirth || '1990-05-15',
      country: req.body.country || 'US',
      addressLine: req.body.addressLine || '100 Financial Way, Suite 400, SF, CA',
    });
    res.status(201).json({ success: true, data: kyc });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'kyc_submission_failed', message: (err as Error).message } });
  }
});

kycRouter.post('/:id/review', (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = kycService.reviewVerification(
      req.params.id,
      req.body.decision,
      req.body.notes,
      req.body.rejectionReason
    );
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'kyc_review_failed', message: (err as Error).message } });
  }
});
