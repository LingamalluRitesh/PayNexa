import { Router, Request, Response } from 'express';
import { iso20022, validateIban, validateBic } from '@paynexa/core';

export const iso20022Router = Router();

// Validate IBAN
iso20022Router.post('/validate-iban', (req: Request, res: Response) => {
  const { iban } = req.body;
  if (!iban) {
    return res.status(400).json({ success: false, error: { message: 'IBAN is required' } });
  }
  const result = validateIban(iban);
  res.json({ success: true, data: result });
});

// Validate BIC
iso20022Router.post('/validate-bic', (req: Request, res: Response) => {
  const { bic } = req.body;
  if (!bic) {
    return res.status(400).json({ success: false, error: { message: 'BIC is required' } });
  }
  const isValid = validateBic(bic);
  res.json({ success: true, data: { isValid, bic } });
});

// Generate pacs.008 XML
iso20022Router.post('/generate-pacs008', (req: Request, res: Response) => {
  try {
    const doc = iso20022.createPacs008Document(req.body);
    const xml = iso20022.generatePacs008Xml(doc);
    res.json({ success: true, data: { xml, document: doc } });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: { message: (err as Error).message } });
  }
});
