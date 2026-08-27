import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { cardIssuingService } from '../services/card-issuing.service.js';

export const cardRouter = Router();

cardRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const card = cardIssuingService.issueCard({
      userId: req.body.userId || req.userId || 'usr_alex_chen',
      cardholderName: req.body.cardholderName || 'Alex Chen',
      currency: req.body.currency || 'USD',
      brand: req.body.brand || 'VISA',
      formFactor: req.body.formFactor || 'GENERAL_PURPOSE',
      spendingLimits: req.body.spendingLimits,
      restrictions: req.body.restrictions,
    });
    res.status(201).json({ success: true, data: card });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'card_issuing_failed', message: (err as Error).message } });
  }
});

cardRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const cards = cardIssuingService.listCards(userId);
  res.json({ success: true, data: cards });
});

cardRouter.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const card = cardIssuingService.getCard(req.params.id);
  if (!card) {
    res.status(404).json({ success: false, error: { code: 'card_not_found', message: 'Card not found' } });
    return;
  }
  res.json({ success: true, data: card });
});

cardRouter.post('/:id/toggle-freeze', (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cardIssuingService.toggleFreeze(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'card_toggle_failed', message: (err as Error).message } });
  }
});

cardRouter.patch('/:id/limits', (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cardIssuingService.updateLimits(req.params.id, req.body.spendingLimits || {});
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'limit_update_failed', message: (err as Error).message } });
  }
});

cardRouter.post('/:id/simulate-auth', (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = cardIssuingService.authorizeTransaction({
      cardId: req.params.id,
      merchantName: req.body.merchantName || 'Target Stores #1294',
      mcc: req.body.mcc || '5411',
      amountCents: req.body.amountCents || 2500,
      currency: req.body.currency || 'USD',
      terminalType: req.body.terminalType || 'POS',
    });
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'authorization_failed', message: (err as Error).message } });
  }
});
