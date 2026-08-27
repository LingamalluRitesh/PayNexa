/**
 * SWIFT FIN Message Standard: MT910ConfirmationOfCredit
 * Description: Real-time Confirmation of Credit to account owner
 * Compliant with SWIFT Standards Release 2026
 */

export interface MT910ConfirmationOfCreditFields {
  sendersReference: string; // Tag 20
  relatedReference?: string; // Tag 21
  bankOperationCode?: string; // Tag 23B
  instructionCode?: string; // Tag 23E
  transactionTypeCode?: string; // Tag 26T
  valueDate: string; // Tag 30 / 32A YYMMDD
  currency: string; // Tag 32A
  amount: number; // Tag 32A
  orderingCustomer?: {
    account?: string;
    name: string;
    address: string;
    country: string;
  }; // Tag 50A/50K
  orderingInstitution?: string; // Tag 52A (BIC)
  sendersCorrespondent?: string; // Tag 53A (BIC)
  receiversCorrespondent?: string; // Tag 54A (BIC)
  intermediaryInstitution?: string; // Tag 56A (BIC)
  accountWithInstitution: string; // Tag 57A (BIC)
  beneficiaryCustomer: {
    account: string;
    name: string;
    address?: string;
  }; // Tag 59
  remittanceInformation?: string[]; // Tag 70
  detailsOfCharges: 'BEN' | 'OUR' | 'SHA'; // Tag 71A
  sendersCharges?: Array<{ currency: string; amount: number }>; // Tag 71F
  receiversCharges?: { currency: string; amount: number }; // Tag 71G
  senderToReceiverInformation?: string[]; // Tag 72
}

export class MT910ConfirmationOfCreditParser {
  public static parse(rawSwiftBlock: string): Partial<MT910ConfirmationOfCreditFields> {
    const lines = rawSwiftBlock.split(/\r?\n/);
    const result: Partial<MT910ConfirmationOfCreditFields> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith(':20:')) {
        result.sendersReference = line.substring(4);
      } else if (line.startsWith(':21:')) {
        result.relatedReference = line.substring(4);
      } else if (line.startsWith(':23B:')) {
        result.bankOperationCode = line.substring(5);
      } else if (line.startsWith(':32A:')) {
        const payload = line.substring(5);
        result.valueDate = payload.slice(0, 6);
        result.currency = payload.slice(6, 9);
        result.amount = parseFloat(payload.slice(9).replace(',', '.'));
      } else if (line.startsWith(':71A:')) {
        result.detailsOfCharges = line.substring(5) as 'BEN' | 'OUR' | 'SHA';
      }
    }

    return result;
  }

  public static format(data: MT910ConfirmationOfCreditFields): string {
    const amtStr = data.amount.toFixed(2).replace('.', ',');
    const lines: string[] = [
      '{1:F01PAYNUS33XXX0000000000}',
      '{2:I103TARGETBICXXXXU}',
      '{4:',
      `:20:${data.sendersReference.slice(0, 16)}`,
    ];

    if (data.relatedReference) {
      lines.push(`:21:${data.relatedReference.slice(0, 16)}`);
    }
    if (data.bankOperationCode) {
      lines.push(`:23B:${data.bankOperationCode}`);
    }

    lines.push(`:32A:${data.valueDate}${data.currency}${amtStr}`);

    if (data.orderingCustomer) {
      lines.push(`:50K:/${data.orderingCustomer.account || 'ACC'}`);
      lines.push(data.orderingCustomer.name.slice(0, 35));
      lines.push(data.orderingCustomer.address.slice(0, 35));
    }

    lines.push(`:57A:${data.accountWithInstitution}`);
    lines.push(`:59:/${data.beneficiaryCustomer.account}`);
    lines.push(data.beneficiaryCustomer.name.slice(0, 35));

    if (data.remittanceInformation && data.remittanceInformation.length > 0) {
      lines.push(`:70:${data.remittanceInformation[0].slice(0, 35)}`);
    }

    lines.push(`:71A:${data.detailsOfCharges}`);
    lines.push('-}');

    return lines.join('\r\n');
  }
}
