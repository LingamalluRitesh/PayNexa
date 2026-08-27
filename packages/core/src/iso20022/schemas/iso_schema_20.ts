/**
 * ISO 20022 Financial Repository Schema #20
 * Standard Reference: ISO 20022 XML & JSON Message Models
 */

export interface IsoFinancialDocument20 {
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

export class IsoValidator20 {
  public static validate(doc: IsoFinancialDocument20): boolean {
    return doc.transactions.length >= 0 && Boolean(doc.messageId);
  }
}
