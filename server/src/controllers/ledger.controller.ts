import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ledgerService } from '../services/ledger.service.js';
import { fxRatesService } from '../services/fx-rates.service.js';
import { db } from '../database/database.js';

export const ledgerRouter = Router();

ledgerRouter.get('/accounts', (req: AuthenticatedRequest, res: Response) => {
  const accounts = ledgerService.listAccounts(req.query.ownerId as string | undefined);
  res.json({ success: true, data: accounts });
});

ledgerRouter.get('/accounts/:id', (req: AuthenticatedRequest, res: Response) => {
  const account = ledgerService.getAccount(req.params.id);
  if (!account) {
    res.status(404).json({ success: false, error: { code: 'account_not_found', message: 'Account not found' } });
    return;
  }
  res.json({ success: true, data: account });
});

ledgerRouter.get('/journal-entries', (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '50', 10);
  const entries = db.table('journalEntries').all().slice(-limit).reverse();
  res.json({ success: true, data: entries });
});

ledgerRouter.get('/postings', (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '100', 10);
  const postings = db.table('postings').all().slice(-limit).reverse();
  res.json({ success: true, data: postings });
});

ledgerRouter.post('/transfer', (req: AuthenticatedRequest, res: Response) => {
  const { sourceAccountId, destinationAccountId, amountCents, currency, description } = req.body;
  try {
    const entry = ledgerService.transferFunds({
      sourceAccountId,
      destinationAccountId,
      amountCents,
      currency: currency || 'USD',
      description: description || 'Account Transfer',
    });
    res.json({ success: true, data: entry });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { code: 'transfer_failed', message: (err as Error).message } });
  }
});

ledgerRouter.get('/audit', (_req: AuthenticatedRequest, res: Response) => {
  const audit = ledgerService.auditSystemLedger();
  res.json({ success: true, data: audit });
});

ledgerRouter.get('/rates', (req: AuthenticatedRequest, res: Response) => {
  const from = req.query.from as string;
  const to = req.query.to as string;
  if (from && to) {
    const rate = fxRatesService.getRate(from as never, to as never);
    res.json({ success: true, data: rate });
    return;
  }
  res.json({ success: true, data: fxRatesService.getAllRates() });
});

ledgerRouter.post('/convert', (req: AuthenticatedRequest, res: Response) => {
  const { amountCents, from, to } = req.body;
  const result = fxRatesService.convert(amountCents, from, to);
  res.json({ success: true, data: result });
});
