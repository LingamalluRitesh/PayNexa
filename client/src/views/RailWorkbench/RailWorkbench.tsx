import React, { useState } from 'react';
import { Network, Zap, Send, FileText, QrCode, CheckCircle2 } from 'lucide-react';
import { achRail } from '../../../../server/src/rails/ach.rail.js';
import { upiRail } from '../../../../server/src/rails/upi.rail.js';
import { pixRail } from '../../../../server/src/rails/pix/pix.service.js';
import { swiftMt103 } from '../../../../server/src/rails/swift/mt103.js';

export const RailWorkbench: React.FC = () => {
  const [selectedRail, setSelectedRail] = useState<'ACH' | 'UPI' | 'PIX' | 'SWIFT'>('ACH');
  const [output, setOutput] = useState<string>('');

  const generateAchSample = () => {
    const nacha = achRail.generateNachaFile({
      immediateDestination: '021000021',
      immediateOrigin: '1234567890',
      batches: [
        {
          serviceClassCode: '200',
          companyName: 'PAYNEXA DISBURSE',
          companyIdentification: '1234567890',
          standardEntryClassCode: 'PPD',
          companyEntryDescription: 'PAYROLL',
          effectiveEntryDate: '260827',
          entries: [
            {
              transactionCode: '22',
              receivingDfiRoutingNumber: '021000021',
              checkDigit: '1',
              dfiAccountNumber: '9876543210',
              amountCents: 450000,
              individualIdentificationNumber: 'EMP-101',
              individualName: 'Alex Chen',
              addendaIndicator: '0',
            },
          ],
        },
      ],
    });
    setOutput(nacha);
  };

  const generateUpiSample = () => {
    const upi = upiRail.generateIntentUrl({
      payeeVpa: 'merchant@paynexa',
      payeeName: 'Acme Superstore',
      merchantCode: '5411',
      transactionId: `TX_${Date.now()}`,
      transactionRefId: `REF_${Date.now()}`,
      transactionNote: 'E-commerce Checkout',
      amountRupees: 2499.0,
    });
    setOutput(`UPI 2.0 Dynamic URI:\n${upi.rawIntentUri}`);
  };

  const generatePixSample = () => {
    const pix = pixRail.generatePixQrPayload({
      pixKey: 'finance@paynexa.io',
      keyType: 'EMAIL',
      merchantName: 'PayNexa Brazil',
      merchantCity: 'Sao Paulo',
      amountReais: 150.0,
      description: 'Order #9921',
    });
    setOutput(`EMVCo BRCode PIX Payload:\n${pix}`);
  };

  const generateSwiftSample = () => {
    const mt103 = swiftMt103.generateMt103({
      transactionReference: `REF${Date.now().toString().slice(-8)}`,
      valueDate: '2026-08-27',
      currency: 'USD',
      amount: 125000.0,
      orderingCustomer: {
        accountNumber: 'US123456789',
        name: 'PayNexa Global Liquidity Inc',
        address: '100 Financial Way',
        cityAndCountry: 'New York, US',
      },
      accountWithInstitutionBic: 'DBEUMM21XXX',
      beneficiaryCustomer: {
        accountNumber: 'DE89370400440532013000',
        name: 'European Cloud Infrastructure GmbH',
      },
      remittanceInformation: 'Intercompany settlement August',
      detailsOfCharges: 'SHA',
    });
    setOutput(mt103);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Network className="w-7 h-7 text-indigo-600" />
          Global Payment Rails & Clearing Workbench
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Interactive batch generators and protocol serializers for NACHA ACH, UPI 2.0, Brazil PIX, and SWIFT MT103.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => { setSelectedRail('ACH'); generateAchSample(); }}
          className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all ${
            selectedRail === 'ACH'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="font-bold">NACHA ACH</div>
          <div className="text-xs text-slate-500 font-normal mt-1">US Fixed-Width 94-char</div>
        </button>

        <button
          onClick={() => { setSelectedRail('UPI'); generateUpiSample(); }}
          className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all ${
            selectedRail === 'UPI'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="font-bold">NPCI UPI 2.0</div>
          <div className="text-xs text-slate-500 font-normal mt-1">Instant QR & Autopay</div>
        </button>

        <button
          onClick={() => { setSelectedRail('PIX'); generatePixSample(); }}
          className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all ${
            selectedRail === 'PIX'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="font-bold">Brazil PIX</div>
          <div className="text-xs text-slate-500 font-normal mt-1">BRCode EMV CRC16</div>
        </button>

        <button
          onClick={() => { setSelectedRail('SWIFT'); generateSwiftSample(); }}
          className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all ${
            selectedRail === 'SWIFT'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="font-bold">SWIFT MT103</div>
          <div className="text-xs text-slate-500 font-normal mt-1">Cross-Border Wire</div>
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl p-5 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner h-96">
        <div className="text-slate-400 mb-2 font-sans font-bold flex justify-between">
          <span>Wire Output Payload ({selectedRail})</span>
        </div>
        <pre>{output || '// Select a payment rail above to generate formatted protocol payload.'}</pre>
      </div>
    </div>
  );
};
