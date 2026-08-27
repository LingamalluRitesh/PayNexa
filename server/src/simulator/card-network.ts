import crypto from 'node:crypto';

export interface CardNetworkSimulationResult {
  approved: boolean;
  responseCode: string; // ISO 8583 response code (00 = Approved, 51 = Insufficient Funds, 54 = Expired, 05 = Do not Honor)
  authCode?: string;
  requires3DS: boolean;
  message: string;
}

export class CardNetworkSimulator {
  /**
   * Simulates card scheme network authorization for Visa, Mastercard, AMEX
   */
  public simulateNetworkAuth(pan: string, amountCents: number): CardNetworkSimulationResult {
    const cleanPan = pan.replace(/\D/g, '');
    const last4 = cleanPan.slice(-4);

    // Test Card Magic Endings
    if (last4 === '0002') {
      return {
        approved: false,
        responseCode: '3DS_REQUIRED',
        requires3DS: true,
        message: '3D Secure 2.2 Strong Customer Authentication required by issuer bank.',
      };
    }

    if (last4 === '0004') {
      return {
        approved: false,
        responseCode: '51',
        requires3DS: false,
        message: 'Declined: Insufficient funds in cardholder account.',
      };
    }

    if (last4 === '0005') {
      return {
        approved: false,
        responseCode: '54',
        requires3DS: false,
        message: 'Declined: Card expired.',
      };
    }

    if (last4 === '0006') {
      return {
        approved: false,
        responseCode: '05',
        requires3DS: false,
        message: 'Declined: Issuer declined transaction (suspected fraud or stolen card).',
      };
    }

    // Default Approval
    return {
      approved: true,
      responseCode: '00',
      authCode: `AUTH_${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      requires3DS: false,
      message: 'Approved by card scheme network.',
    };
  }
}

export const cardSimulator = new CardNetworkSimulator();
