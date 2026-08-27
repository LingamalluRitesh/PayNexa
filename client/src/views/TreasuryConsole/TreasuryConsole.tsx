import React, { useState } from 'react';
import { Landmark, ArrowUpRight, ArrowDownRight, Scale, PieChart, ShieldCheck, DollarSign, Euro, PoundSterling } from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';

export const TreasuryConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BALANCES' | 'COA' | 'INCOME_STMT'>('BALANCES');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-7 h-7 text-indigo-600" />
            Treasury, Liquidity & General Ledger
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time central bank liquidity pools, Nostro accounts, and GAAP/IFRS Chart of Accounts.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-sm font-semibold">
          <ShieldCheck className="w-4 h-4" />
          Global Balance Proof: Assets == Liabilities + Equity
        </div>
      </div>

      {/* Liquidity Reserves Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Fed Liquidity Reserve (USD)"
          value="$1,000,000.00"
          subtitle="Central Bank Tier 1 Liquidity"
          icon={DollarSign}
        />
        <StatCard
          title="ECB Target2 Reserve (EUR)"
          value="€24,350.00"
          subtitle="Target Instant Clearing Pool"
          icon={Euro}
        />
        <StatCard
          title="Scheme Clearing Transit"
          value="$58,240.00"
          subtitle="Visa / MC In-Flight Settlements"
          icon={Scale}
        />
        <StatCard
          title="Retained Capital & Equity"
          value="$950,038.00"
          subtitle="Statutory Paid-In Capital"
          icon={PieChart}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('BALANCES')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'BALANCES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Consolidated Balance Sheet
        </button>
        <button
          onClick={() => setActiveTab('COA')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'COA'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Chart of Accounts (COA) Taxonomy
        </button>
        <button
          onClick={() => setActiveTab('INCOME_STMT')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'INCOME_STMT'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          P&L / Income Statement
        </button>
      </div>

      {/* Tab 1: Balance Sheet */}
      {activeTab === 'BALANCES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between border-b pb-3">
              <span>Assets (Debit Normal)</span>
              <span className="text-indigo-600 font-mono font-bold">$1,058,240.00</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">111000 - Federal Reserve Liquidity Pool</div>
                  <div className="text-xs text-slate-500">Central Bank Direct Nostro</div>
                </div>
                <div className="font-mono font-semibold text-slate-900">$1,000,000.00</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">121000 - Visa/Mastercard Scheme Clearing</div>
                  <div className="text-xs text-slate-500">Receivable from Card Interchange</div>
                </div>
                <div className="font-mono font-semibold text-slate-900">$58,240.00</div>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between border-b pb-3">
              <span>Liabilities & Equity (Credit Normal)</span>
              <span className="text-indigo-600 font-mono font-bold">$1,058,240.00</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">210000 - Consumer Digital Wallets</div>
                  <div className="text-xs text-slate-500">Stored Value Demand Deposits</div>
                </div>
                <div className="font-mono font-semibold text-slate-900">$19,100.00</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">220000 - Merchant Settlement Payables</div>
                  <div className="text-xs text-slate-500">Undisbursed Merchant Balances</div>
                </div>
                <div className="font-mono font-semibold text-slate-900">$84,520.00</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">410000 - Platform Net Processing Fees</div>
                  <div className="text-xs text-slate-500">Accumulated Processing Revenue</div>
                </div>
                <div className="font-mono font-semibold text-emerald-600">+$4,582.00</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">310000 - Contributed Capital & Equity</div>
                  <div className="text-xs text-slate-500">Tier 1 Capital Reserves</div>
                </div>
                <div className="font-mono font-semibold text-slate-900">$950,038.00</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chart of Accounts */}
      {activeTab === 'COA' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Hierarchical Chart of Accounts (COA)</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Account Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Normal Balance</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-mono font-semibold text-indigo-600">111000</td>
                <td className="py-2.5 px-4 font-medium text-slate-900">Federal Reserve Central Liquidity Reserve</td>
                <td className="py-2.5 px-4"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-semibold">ASSET</span></td>
                <td className="py-2.5 px-4 text-xs font-semibold text-slate-700">DEBIT</td>
                <td className="py-2.5 px-4 text-slate-500">Tier-1 central bank settlement reserve</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-mono font-semibold text-indigo-600">121000</td>
                <td className="py-2.5 px-4 font-medium text-slate-900">Visa Scheme Clearing Transit</td>
                <td className="py-2.5 px-4"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-semibold">ASSET</span></td>
                <td className="py-2.5 px-4 text-xs font-semibold text-slate-700">DEBIT</td>
                <td className="py-2.5 px-4 text-slate-500">Visa interchange receivables in transit</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-mono font-semibold text-indigo-600">211000</td>
                <td className="py-2.5 px-4 font-medium text-slate-900">Consumer Digital Stored Value Wallets</td>
                <td className="py-2.5 px-4"><span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-semibold">LIABILITY</span></td>
                <td className="py-2.5 px-4 text-xs font-semibold text-slate-700">CREDIT</td>
                <td className="py-2.5 px-4 text-slate-500">Customer digital balances payable</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-mono font-semibold text-indigo-600">410000</td>
                <td className="py-2.5 px-4 font-medium text-slate-900">Payment Processing Fee Revenues</td>
                <td className="py-2.5 px-4"><span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-semibold">REVENUE</span></td>
                <td className="py-2.5 px-4 text-xs font-semibold text-slate-700">CREDIT</td>
                <td className="py-2.5 px-4 text-slate-500">2.9% + $0.30 processing transaction fees</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: P&L Statement */}
      {activeTab === 'INCOME_STMT' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Statement of Profit & Loss (P&L)</h3>
          <p className="text-xs text-slate-500 mb-6">Period: YTD Fiscal 2026 (Currency: USD)</p>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between font-semibold text-slate-800 border-b pb-2">
              <span>Gross Processing Revenues</span>
              <span className="font-mono text-emerald-600">+$4,582.00</span>
            </div>
            <div className="flex justify-between text-slate-600 pl-4">
              <span>- Interchange Costs & Scheme Assessments</span>
              <span className="font-mono text-red-600">-$1,420.00</span>
            </div>
            <div className="flex justify-between text-slate-600 pl-4">
              <span>- 3DS ACS & Network Routing Fees</span>
              <span className="font-mono text-red-600">-$185.00</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t pt-3 text-base">
              <span>Net Operating Profit</span>
              <span className="font-mono text-indigo-600">+$2,977.00</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
