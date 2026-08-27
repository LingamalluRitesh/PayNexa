import { Router, Request, Response } from 'express';
import { amlEngine } from '../aml/aml.service.js';

export const amlRouter = Router();

amlRouter.post('/screen-party', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: { message: 'Party name is required' } });
  }
  const result = amlEngine.screenName(name);
  res.json({ success: true, data: result });
});

amlRouter.get('/structuring-analysis/:customerId', (req: Request, res: Response) => {
  const { customerId } = req.params;
  const analysis = amlEngine.detectStructuring(customerId);
  res.json({ success: true, data: analysis });
});
