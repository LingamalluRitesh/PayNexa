import React, { useState } from 'react';
import { FileCode, Binary, CheckCircle2, Copy, Send, RefreshCw, Layers } from 'lucide-react';
import { iso20022, validateIban, validateBic } from '@paynexa/core';
import { iso8583 } from '../../../../server/src/iso8583/packager.js';

export const IsoMessageHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ISO20022' | 'ISO8583'>('ISO20022');
  const [ibanInput, setIbanInput] = useState('DE89370400440532013000');
  const [ibanValidation, setIbanValidation] = useState<any>(null);
  const [generatedXml, setGeneratedXml] = useState<string>('');

  const handleValidateIban = () => {
    const res = validateIban(ibanInput);
    setIbanValidation(res);
  };

  const handleGeneratePacs008 = () => {
    const doc = iso20022.createPacs008Document({
      endToEndId: `E2E_${Date.now()}`,
      amount: 4500.0,
      currency: 'EUR',
      debtorName: 'Acme Enterprises Europe',
      debtorIban: ibanInput,
      debtorBic: 'DBEUMM21XXX',
      creditorName: 'Global Supplier SARL',
      creditorIban: 'FR1420041010050500013M02606',
      creditorBic: 'BNPAFRPP',
      remittanceInfo: 'Payment for invoice #INV-9921',
    });
    const xml = iso20022.generatePacs008Xml(doc);
    setGeneratedXml(xml);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileCode className="w-7 h-7 text-indigo-600" />
          ISO 20022 & ISO 8583 Financial Message Hub
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Universal financial messaging schemas, XML serializers, and ISO 8583 bitmap analyzers.
        </p>
      </div>

      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('ISO20022')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'ISO20022'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          ISO 20022 (pacs.008 / XML)
        </button>
        <button
          onClick={() => setActiveTab('ISO8583')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'ISO8583'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          ISO 8583 (Card Scheme Bitmaps)
        </button>
      </div>

      {activeTab === 'ISO20022' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">IBAN Mod-97 Checksum Validator</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={ibanInput}
                onChange={(e) => setIbanInput(e.target.value)}
                placeholder="Enter European / International IBAN"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm uppercase"
              />
              <button
                onClick={handleValidateIban}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                Validate
              </button>
            </div>

            {ibanValidation && (
              <div
                className={`p-3 rounded-lg border text-sm ${
                  ibanValidation.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="font-semibold">
                  {ibanValidation.isValid ? '✅ Valid IBAN Format & Checksum' : '❌ Invalid IBAN'}
                </div>
                {ibanValidation.isValid && (
                  <div className="text-xs mt-1">
                    Country: {ibanValidation.countryCode} | Bank Code: {ibanValidation.bankCode}
                  </div>
                )}
                {!ibanValidation.isValid && <div className="text-xs mt-1">{ibanValidation.error}</div>}
              </div>
            )}

            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Generate Sample pacs.008.001.10 XML</h4>
              <button
                onClick={handleGeneratePacs008}
                className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Generate XML Credit Transfer
              </button>
            </div>
          </div>

          {/* XML Output */}
          <div className="bg-slate-900 rounded-xl p-5 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner h-96">
            <div className="text-slate-400 mb-2 font-sans font-bold flex justify-between">
              <span>XML Output (urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10)</span>
            </div>
            <pre>{generatedXml || '// Click "Generate XML Credit Transfer" to view formatted pacs.008 payload.'}</pre>
          </div>
        </div>
      )}

      {activeTab === 'ISO8583' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Binary className="w-5 h-5 text-indigo-600" />
            ISO 8583:1987 Financial Authorization Message (0100)
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Wire format breakdown of 128-bit Primary & Secondary Bitmaps and packed Data Elements.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs border border-slate-200 space-y-2">
            <div><span className="text-indigo-600 font-bold">MTI:</span> 0100 (Authorization Request)</div>
            <div><span className="text-indigo-600 font-bold">Primary Bitmap:</span> F238400108A18000</div>
            <div className="border-t border-slate-200 pt-2 space-y-1 text-slate-700">
              <div>• DE 2 (PAN): 4532 •••• •••• 8821</div>
              <div>• DE 3 (Proc Code): 000000 (Purchase)</div>
              <div>• DE 4 (Amount): 000000005000 ($50.00)</div>
              <div>• DE 11 (STAN): 001948</div>
              <div>• DE 22 (POS Entry): 051 (EMV Chip + PIN)</div>
              <div>• DE 38 (Auth Code): 849201</div>
              <div>• DE 39 (Response Code): 00 (Approved)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
