/**
 * Global Sanctions Entity Profile #141
 * Source Authority: OFAC / EU / UK HMT / UN Consolidated Sanctions Database
 */

export interface SanctionEntityRecord141 {
  profileId: string;
  sourceAuthority: 'OFAC' | 'EU_FINANCIAL_SANCTIONS' | 'UK_HMT' | 'UN_SECURITY_COUNCIL';
  entityName: string;
  knownAliases: string[];
  entityType: 'INDIVIDUAL' | 'CORPORATE_BODY' | 'FINANCIAL_INSTITUTION' | 'MARITIME_VESSEL';
  sanctionPrograms: string[];
  associatedAddresses: Array<{
    streetAddress?: string;
    city: string;
    stateOrProvince?: string;
    postalCode?: string;
    countryIso2: string;
  }>;
  identityDocuments: Array<{
    documentType: 'PASSPORT' | 'NATIONAL_ID' | 'TAX_REGISTRATION' | 'CORPORATE_LEI';
    documentNumber: string;
    issuingCountry: string;
  }>;
  riskScore: number; // 0 to 100
  isActiveListing: boolean;
}

export class SanctionProfileMatcher141 {
  public static evaluateMatch(targetName: string, candidate: SanctionEntityRecord141): number {
    const cleanTarget = targetName.trim().toUpperCase();
    const cleanCandidate = candidate.entityName.trim().toUpperCase();
    if (cleanTarget === cleanCandidate) return 100;
    for (const alias of candidate.knownAliases) {
      if (cleanTarget === alias.trim().toUpperCase()) return 95;
    }
    return 0;
  }
}
