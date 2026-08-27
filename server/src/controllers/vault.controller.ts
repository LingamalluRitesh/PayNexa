import { Router, Request, Response } from 'express';
import { pciVault } from '../vault/vault.service.js';

export const vaultRouter = Router();

vaultRouter.post('/tokenize', (req: Request, res: Response) => {
  try {
    const token = pciVault.tokenizeCard(req.body);
    res.json({ success: true, data: token });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { message: (err as Error).message } });
  }
});
