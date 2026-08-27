/**
 * ISO 20022 Financial Repository Schema #14
 * Standard Reference: ISO 20022 XML & JSON Message Models
 */

export interface IsoFinancialDocument14 {
  messageId: string;
  originatingPartyBic: string;
  instructedPartyBic: string;
  settlementCurrency: string;
  totalVolume: number;
  transactions: Array<{
    txId: string;
    uetr: string;
    amount: number;
    debtor: string;
    creditor: string;
  }>;
}

export class IsoValidator14 {
  public static validate(doc: IsoFinancialDocument14): boolean {
    return doc.transactions.length >= 0 && Boolean(doc.messageId);
  }
}
