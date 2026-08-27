/**
 * UK Open Banking & Berlin Group NextGenPSD2 Payment Initiation Services (PISP)
 * Compliant with Open Banking Read/Write API Profile v3.1.10
 */

export interface OBWriteDomestic2 {
  data: {
    consentId: string;
    initiation: OBWriteDomestic2DataInitiation;
  };
  risk: {
    paymentContextCode?: 'BillPayment' | 'EcommerceGoods' | 'EcommerceServices' | 'Other' | 'PartyToParty';
    merchantCategoryCode?: string;
    merchantCustomerIdentification?: string;
    deliveryAddress?: {
      addressLine?: string[];
      streetName?: string;
      buildingNumber?: string;
      postCode?: string;
      townName: string;
      countrySubDivision?: string[];
      country: string;
    };
  };
}

export interface OBWriteDomestic2DataInitiation {
  instructionIdentification: string;
  endToEndIdentification: string;
  localInstrument?: string;
  instructedAmount: {
    amount: string;
    currency: string;
  };
  debtorAccount?: {
    schemeName: string;
    identification: string;
    name?: string;
    secondaryIdentification?: string;
  };
  creditorAccount: {
    schemeName: 'UK.OBIE.SortCodeAccountNumber' | 'UK.OBIE.IBAN' | 'UK.OBIE.PAN';
    identification: string;
    name: string;
    secondaryIdentification?: string;
  };
  creditorPostalAddress?: {
    addressType?: string;
    department?: string;
    subDepartment?: string;
    streetName?: string;
    buildingNumber?: string;
    buildingName?: string;
    floor?: string;
    postBox?: string;
    room?: string;
    postCode?: string;
    townName: string;
    countrySubDivision?: string;
    country: string;
    addressLine?: string[];
  };
  remittanceInformation?: {
    unstructured?: string;
    reference?: string;
  };
  supplementaryData?: Record<string, unknown>;
}

export interface OBWriteDomesticResponse5 {
  data: {
    domesticPaymentId: string;
    consentId: string;
    creationDateTime: string;
    status: 'Pending' | 'Rejected' | 'AcceptedSettlementInProcess' | 'AcceptedSettlementCompleted' | 'AcceptedWithoutPosting';
    statusUpdateDateTime: string;
    expectedExecutionDateTime?: string;
    expectedSettlementDateTime?: string;
    refund?: {
      account: {
        schemeName: string;
        identification: string;
        name: string;
      };
    };
    charges?: Array<{
      chargeBearer: 'BorneByDebtor' | 'BorneByCreditor' | 'Shared' | 'FollowingServiceLevel';
      type: string;
      amount: { amount: string; currency: string };
    }>;
    initiation: OBWriteDomestic2DataInitiation;
  };
  links: { self: string };
  meta: Record<string, unknown>;
}
