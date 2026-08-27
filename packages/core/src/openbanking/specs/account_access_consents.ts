/**
 * Open Banking UK & Berlin Group PSD2 Specification: OBAccountAccessConsent1
 * Description: Account Access Consents API for authorization grant lifecycle
 * Compliant with Open Banking Standard v3.1.10 & NextGenPSD2 v1.3.6
 */

export interface OBAccountAccessConsent1Request {
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

export interface OBAccountAccessConsent1Response {
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

export class OBAccountAccessConsent1Handler {
  public static validateConsent(req: OBAccountAccessConsent1Request): boolean {
    if (!req.data) return false;
    return true;
  }
}
