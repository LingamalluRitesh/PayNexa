/**
 * Open Banking UK & Berlin Group PSD2 Specification: BerlinGroupNextGenPsd2
 * Description: Berlin Group NextGenPSD2 XS2A Pan-European Interoperability Framework
 * Compliant with Open Banking Standard v3.1.10 & NextGenPSD2 v1.3.6
 */

export interface BerlinGroupNextGenPsd2Request {
  data: {
    consentId?: string;
    initiationPayload: Record<string, unknown>;
    permissions?: Array<'ReadAccountsDetail' | 'ReadBalances' | 'ReadTransactionsDetail' | 'ReadDirectDebits' | 'ReadStandingOrdersDetail' | 'ReadStatementsDetail'>;
    expirationDateTime?: string;
    transactionFromDateTime?: string;
    transactionToDateTime?: string;
  };
  risk: {
    paymentContextCode?: string;
    merchantCategoryCode?: string;
    deliveryAddress?: {
      townName: string;
      country: string;
      postCode?: string;
    };
  };
}

export interface BerlinGroupNextGenPsd2Response {
  data: {
    resourceId: string;
    consentId: string;
    status: 'Authorised' | 'AwaitingAuthorisation' | 'Rejected' | 'Revoked' | 'Consumed';
    creationDateTime: string;
    statusUpdateDateTime: string;
    permissions?: string[];
  };
  links: { self: string; first?: string; next?: string };
  meta: { totalPages?: number };
}

export class BerlinGroupNextGenPsd2Handler {
  public static validateConsent(req: BerlinGroupNextGenPsd2Request): boolean {
    if (!req.data) return false;
    return true;
  }
}
