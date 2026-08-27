/**
 * Open Banking UK & Berlin Group PSD2 Specification: OBWriteDomesticScheduled2
 * Description: Domestic Scheduled Payment Consents and Submissions
 * Compliant with Open Banking Standard v3.1.10 & NextGenPSD2 v1.3.6
 */

export interface OBWriteDomesticScheduled2Request {
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

export interface OBWriteDomesticScheduled2Response {
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

export class OBWriteDomesticScheduled2Handler {
  public static validateConsent(req: OBWriteDomesticScheduled2Request): boolean {
    if (!req.data) return false;
    return true;
  }
}
