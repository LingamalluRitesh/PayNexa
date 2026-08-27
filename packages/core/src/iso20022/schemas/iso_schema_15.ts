/**
 * ISO 20022 Financial Repository Schema #15
 * Standard Reference: ISO 20022 XML & JSON Message Models
 */

export interface IsoFinancialDocument15 {
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

export class IsoValidator15 {
  public static validate(doc: IsoFinancialDocument15): boolean {
    return doc.transactions.length >= 0 && Boolean(doc.messageId);
  }
}
