import { Router, Request, Response } from 'express';
import { reconciliationEngine } from '../reconciliation/reconciliation.service.js';

export const reconciliationRouter = Router();

reconciliationRouter.post('/reconcile', (req: Request, res: Response) => {
  try {
    const { clearingRecords, targetDate } = req.body;
    const report = reconciliationEngine.reconcileBatch(clearingRecords || [], targetDate);
    const csv = reconciliationEngine.generateReconciliationCsv(report);
    res.json({ success: true, data: { report, csv } });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { message: (err as Error).message } });
  }
});
