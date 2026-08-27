/**
 * Open Banking Domain Model #3
 * Open Banking Read/Write API Profile v3.1.10 Specifications
 */

export interface OBDataEntity3 {
  id: string;
  entityType: string;
  creationTimestamp: string;
  attributes: Record<string, unknown>;
  authorisationStatus: 'Pending' | 'Authorised' | 'Rejected' | 'Revoked';
  consentMetadata: {
    consentedPermissions: string[];
    debtorAccountScheme?: string;
    creditorAccountScheme?: string;
    maximumCumulativeLimitCents?: number;
  };
}

export class OBDataProcessor3 {
  public static process(entity: OBDataEntity3): boolean {
    return Boolean(entity.id && entity.authorisationStatus);
  }
}
