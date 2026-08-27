/**
 * FinCEN Suspicious Activity Report (SAR Form 111) & Currency Transaction Report (CTR Form 112)
 * Automated XML message generator conforming to FinCEN BSA XML Schema v2.0
 */

export interface FinCENActivityRecord {
  bsaIdentifier: string;
  reportingInstitutionName: string;
  reportingInstitutionTin: string;
  reportingInstitutionBic: string;
  filingDate: string; // YYYY-MM-DD
  narrativeText: string;
  totalSuspiciousAmountCents: number;
  suspiciousDateRange: { fromDate: string; toDate: string };
  subjectParty: {
    individualFullName: string;
    birthDate?: string;
    tinOrSsnMasked?: string;
    address: { street: string; city: string; state: string; postalCode: string; country: string };
    accountNumbers: string[];
    occupationOrBusiness?: string;
  };
  suspiciousCategories: Array<'STRUCTURING' | 'TERRORIST_FINANCING' | 'MONEY_LAUNDERING' | 'FRAUD_IDENTITY_THEFT' | 'CYBER_INTRUSION'>;
}

export class FinCENReportFiler {
  /**
   * Generates standard FinCEN BSA XML 2.0 SAR document
   */
  public generateSarXml(record: FinCENActivityRecord): string {
    const formattedAmount = (record.totalSuspiciousAmountCents / 100).toFixed(2);
    const sub = record.subjectParty;

    return `<?xml version="1.0" encoding="UTF-8"?>
<FCB2_Batch xmlns="http://www.fincen.gov/bsa/2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Activity>
    <EFilingPrioritisedActivityIndicator>false</EFilingPrioritisedActivityIndicator>
    <ActivitySeqNum>1</ActivitySeqNum>
    <FilingDateText>${record.filingDate}</FilingDateText>
    <ActivityCategoryCode>SAR</ActivityCategoryCode>
    <NarrativeInformation>
      <NarrativeText>${this.escapeXml(record.narrativeText)}</NarrativeText>
    </NarrativeInformation>
    <ActivityParty>
      <ActivityPartyTypeCode>FILING_INSTITUTION</ActivityPartyTypeCode>
      <PartyName>
        <RawPartyFullName>${this.escapeXml(record.reportingInstitutionName)}</RawPartyFullName>
      </PartyName>
      <PartyIdentification>
        <PartyIdentificationNumberText>${record.reportingInstitutionTin}</PartyIdentificationNumberText>
        <PartyIdentificationTypeCode>TIN</PartyIdentificationTypeCode>
      </PartyIdentification>
    </ActivityParty>
    <ActivityParty>
      <ActivityPartyTypeCode>SUBJECT</ActivityPartyTypeCode>
      <PartyName>
        <RawPartyFullName>${this.escapeXml(sub.individualFullName)}</RawPartyFullName>
      </PartyName>
      <Address>
        <RawStreetAddressText>${this.escapeXml(sub.address.street)}</RawStreetAddressText>
        <RawCityText>${this.escapeXml(sub.address.city)}</RawCityText>
        <RawStateCodeText>${sub.address.state}</RawStateCodeText>
        <RawZIPCode>${sub.address.postalCode}</RawZIPCode>
        <RawCountryCodeText>${sub.address.country}</RawCountryCodeText>
      </Address>
    </ActivityParty>
    <SuspiciousActivitySummary>
      <SuspiciousActivityAmountText>${formattedAmount}</SuspiciousActivityAmountText>
      <SuspiciousActivityFromDateText>${record.suspiciousDateRange.fromDate}</SuspiciousActivityFromDateText>
      <SuspiciousActivityToDateText>${record.suspiciousDateRange.toDate}</SuspiciousActivityToDateText>
      ${record.suspiciousCategories.map((c) => `<SuspiciousCategoryCode>${c}</SuspiciousCategoryCode>`).join('')}
    </SuspiciousActivitySummary>
  </Activity>
</FCB2_Batch>`;
  }

  private escapeXml(str: string): string {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

export const fincenFiler = new FinCENReportFiler();
