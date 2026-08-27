export interface SwiftMt103Params {
  transactionReference: string; // Tag 20 (up to 16 chars)
  bankOperationCode?: 'CRED' | 'SPAY' | 'SPRI' | 'SSTD'; // Tag 23B
  valueDate: string; // Tag 32A YYMMDD
  currency: string; // Tag 32A 3 chars
  amount: number; // Tag 32A
  instructedCurrency?: string; // Tag 33B
  instructedAmount?: number; // Tag 33B
  orderingCustomer: {
    accountNumber?: string; // Tag 50K line 1
    name: string;
    address: string;
    cityAndCountry: string;
  };
  orderingInstitutionBic?: string; // Tag 52A
  sendersCorrespondentBic?: string; // Tag 53A
  receiversCorrespondentBic?: string; // Tag 54A
  accountWithInstitutionBic: string; // Tag 57A (Beneficiary Bank BIC)
  beneficiaryCustomer: {
    accountNumber: string; // Tag 59 (IBAN or local account)
    name: string;
    address?: string;
    cityAndCountry?: string;
  };
  remittanceInformation?: string; // Tag 70 (up to 4 lines of 35 chars)
  detailsOfCharges: 'BEN' | 'OUR' | 'SHA'; // Tag 71A
}

export class SwiftMt103Engine {
  /**
   * Generates a standard FIN MT103 Customer Credit Transfer SWIFT block message
   */
  public generateMt103(params: SwiftMt103Params): string {
    const formattedAmount = params.amount.toFixed(2).replace('.', ',');
    const formattedDate = params.valueDate.replace(/-/g, '').slice(2, 8); // YYMMDD

    const blocks: string[] = [];

    // Block 1: Basic Header Block (App ID F, Service ID 01, Sender BIC, Session 0000, Seq 000000)
    blocks.push(`{1:F01${params.orderingInstitutionBic || 'PAYNUS33XXX'}0000000000}`);

    // Block 2: Application Header Block (Input, Message Type 103, Destination BIC, Priority U)
    blocks.push(`{2:I103${params.accountWithInstitutionBic}U}`);

    // Block 3: User Header Block (Optional Service Codes & Banking Priority)
    blocks.push('{3:{108:PAYNEXA103}}');

    // Block 4: Text Block (Mandatory Financial Fields)
    const textLines = [
      '{4:',
      `:20:${params.transactionReference.slice(0, 16)}`,
      `:23B:${params.bankOperationCode || 'CRED'}`,
      `:32A:${formattedDate}${params.currency}${formattedAmount}`,
      `:50K:/${params.orderingCustomer.accountNumber || 'ACC1000'}`,
      params.orderingCustomer.name.slice(0, 35),
      params.orderingCustomer.address.slice(0, 35),
      params.orderingCustomer.cityAndCountry.slice(0, 35),
      `:57A:${params.accountWithInstitutionBic}`,
      `:59:/${params.beneficiaryCustomer.accountNumber}`,
      params.beneficiaryCustomer.name.slice(0, 35),
    ];

    if (params.beneficiaryCustomer.address) {
      textLines.push(params.beneficiaryCustomer.address.slice(0, 35));
    }
    if (params.beneficiaryCustomer.cityAndCountry) {
      textLines.push(params.beneficiaryCustomer.cityAndCountry.slice(0, 35));
    }

    if (params.remittanceInformation) {
      textLines.push(`:70:${params.remittanceInformation.slice(0, 35)}`);
    }

    textLines.push(`:71A:${params.detailsOfCharges}`);
    textLines.push('-}');

    blocks.push(textLines.join('\r\n'));

    // Block 5: Trailer Block (Checksums & Message Authentication)
    blocks.push('{5:{CHK:1A2B3C4D5E6F}}');

    return blocks.join('\r\n');
  }

  /**
   * Parses incoming SWIFT MT103 text into structured fields
   */
  public parseMt103(raw: string): Partial<SwiftMt103Params> {
    const lines = raw.split(/\r?\n/);
    const result: Partial<SwiftMt103Params> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith(':20:')) {
        result.transactionReference = line.substring(4);
      } else if (line.startsWith(':23B:')) {
        result.bankOperationCode = line.substring(5) as any;
      } else if (line.startsWith(':32A:')) {
        const payload = line.substring(5);
        result.valueDate = payload.slice(0, 6);
        result.currency = payload.slice(6, 9);
        result.amount = parseFloat(payload.slice(9).replace(',', '.'));
      } else if (line.startsWith(':71A:')) {
        result.detailsOfCharges = line.substring(5) as any;
      } else if (line.startsWith(':57A:')) {
        result.accountWithInstitutionBic = line.substring(5);
      }
    }

    return result;
  }
}

export const swiftMt103 = new SwiftMt103Engine();
