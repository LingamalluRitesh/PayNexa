import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { CreditCardVisualizer } from '../../components/CreditCardVisualizer';
import { CurrencyBadge } from '../../components/CurrencyBadge';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Wallet,
  Send,
  ArrowRightLeft,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react';

export const ConsumerPortal: React.FC = () => {
  const { currentUser, accounts, cards, refreshData, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'cards' | 'transfer' | 'fx' | 'activity'>('cards');
  const [journalEntries, setJournalEntries] = useState<any[]>([]);

  // P2P Transfer form state
  const [destAccountId, setDestAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // FX Swap form state
  const [fxFrom, setFxFrom] = useState('USD');
  const [fxTo, setFxTo] = useState('EUR');
  const [fxAmount, setFxAmount] = useState('100');
  const [fxResult, setFxResult] = useState<any>(null);

  // New Virtual Card form state
  const [newCardModal, setNewCardModal] = useState(false);
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Alex Chen');
  const [cardBrand, setCardBrand] = useState<'VISA' | 'MASTERCARD'>('VISA');
  const [cardFormFactor, setCardFormFactor] = useState<'GENERAL_PURPOSE' | 'SINGLE_USE'>('GENERAL_PURPOSE');
  const [monthlyLimit, setMonthlyLimit] = useState('2500');

  useEffect(() => {
    loadConsumerData();
  }, []);

  useEffect(() => {
    calculateFx();
  }, [fxFrom, fxTo, fxAmount]);

  const loadConsumerData = async () => {
    try {
      const entries = await api.getJournalEntries(30);
      setJournalEntries(entries);
    } catch (err) {
      console.error('Error loading consumer data:', err);
    }
  };

  const calculateFx = async () => {
    if (!fxAmount || parseFloat(fxAmount) <= 0) return;
    try {
      const amountCents = Math.round(parseFloat(fxAmount) * 100);
      const res = await api.convertCurrency({ amountCents, from: fxFrom, to: fxTo });
      setFxResult(res);
    } catch (err) {
      // ignore
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const limitCents = Math.round(parseFloat(monthlyLimit) * 100);
      await api.createCard({
        userId: currentUser?.id || 'usr_alex_chen',
        cardholderName: cardHolder,
        brand: cardBrand,
        formFactor: cardFormFactor,
        spendingLimits: {
          perTransactionMaxCents: limitCents / 2,
          dailyMaxCents: limitCents,
          monthlyMaxCents: limitCents,
        },
      });

      setNewCardModal(false);
      refreshData();
      addNotification({
        type: 'success',
        title: 'Virtual Card Issued',
        message: `Your new ${cardBrand} virtual card is active and ready for online spending.`,
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleToggleFreeze = async (cardId: string) => {
    try {
      const updated = await api.toggleCardFreeze(cardId);
      refreshData();
      addNotification({
        type: updated.status === 'FROZEN' ? 'warning' : 'success',
        title: updated.status === 'FROZEN' ? 'Card Frozen' : 'Card Unfrozen',
        message: `Card ending in ${updated.last4} is now ${updated.status.toLowerCase()}.`,
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleP2PTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTransfer(true);
    try {
      const userAccounts = accounts.filter((a) => a.ownerId === currentUser?.id || a.ownerType === 'CUSTOMER');
      const sourceAcc = userAccounts[0] || accounts[0];

      if (!sourceAcc) throw new Error('No source wallet account available');

      const amountCents = Math.round(parseFloat(transferAmount) * 100);

      await api.transfer({
        sourceAccountId: sourceAcc.id,
        destinationAccountId: destAccountId,
        amountCents,
        currency: sourceAcc.currency,
        description: transferDesc || 'P2P Instant Transfer',
      });

      setTransferAmount('');
      setTransferDesc('');
      refreshData();
      loadConsumerData();
      addNotification({
        type: 'success',
        title: 'Transfer Completed',
        message: `Transferred $${(amountCents / 100).toFixed(2)} instantly with double-entry ledger guarantee.`,
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // Find current user's wallet accounts
  const userWallets = accounts.filter(
    (a) => a.ownerId === currentUser?.id || a.category === 'CUSTOMER_WALLET'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Digital Consumer Wallet
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Multi-currency stored value balances, instant peer-to-peer routing, and virtual cards.
          </p>
        </div>

        <button
          onClick={() => setNewCardModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Issue Virtual Card
        </button>
      </div>

      {/* Multi-Currency Balances Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {userWallets.map((acc) => (
          <div key={acc.id} className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{acc.name}</span>
              <CurrencyBadge currency={acc.currency} />
            </div>

            <div className="mt-4">
              <div className="text-2xl font-extrabold text-white">
                {acc.currency === 'INR' ? '₹' : acc.currency === 'EUR' ? '€' : '$'}
                {(acc.balanceCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span>Available:</span>
                <span className="font-semibold text-emerald-400">
                  {acc.currency === 'INR' ? '₹' : '$'}{(acc.availableBalanceCents / 100).toFixed(2)}
                </span>
                {acc.pendingHoldCents > 0 && (
                  <span className="text-amber-400 ml-1">(${(acc.pendingHoldCents / 100).toFixed(2)} on hold)</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 pb-px">
        {[
          { id: 'cards', label: 'Virtual Cards Hub', icon: CreditCard },
          { id: 'transfer', label: 'P2P Money Transfer', icon: Send },
          { id: 'fx', label: 'Currency Exchange', icon: ArrowRightLeft },
          { id: 'activity', label: 'Ledger Activity', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold transition ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: VIRTUAL CARDS */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div key={card.id} className="flex flex-col items-center">
                <CreditCardVisualizer card={card} onToggleFreeze={handleToggleFreeze} />
                <div className="w-full max-w-sm mt-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs flex items-center justify-between text-slate-400">
                  <span>Monthly Spending:</span>
                  <span className="font-mono text-white font-semibold">
                    ${((card.spendingLimits?.currentMonthSpentCents || 0) / 100).toFixed(2)} / $
                    {((card.spendingLimits?.monthlyMaxCents || 500000) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: P2P TRANSFER */}
      {activeTab === 'transfer' && (
        <div className="max-w-xl mx-auto glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Instant P2P Transfer</h3>
            <p className="text-xs text-slate-400 mt-1">
              Transfer funds between accounts with zero network fees and atomic double-entry balance updates.
            </p>
          </div>

          <form onSubmit={handleP2PTransfer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Recipient Account</label>
              <select
                required
                value={destAccountId}
                onChange={(e) => setDestAccountId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="">Select recipient ledger account...</option>
                {accounts
                  .filter((a) => a.ownerId !== currentUser?.id)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.code}) — {a.currency}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="50.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description / Note</label>
              <input
                type="text"
                placeholder="e.g. Dinner split / freelance payment"
                value={transferDesc}
                onChange={(e) => setTransferDesc(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingTransfer || !destAccountId || !transferAmount}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmittingTransfer ? 'Transferring...' : 'Send Funds Instantly'}
            </button>
          </form>
        </div>
      )}

      {/* TAB: FX CONVERSION */}
      {activeTab === 'fx' && (
        <div className="max-w-xl mx-auto glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Live Multi-Currency FX Swap</h3>
            <p className="text-xs text-slate-400 mt-1">
              Exchange between major global fiat currencies at institutional exchange rates.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">From Currency</label>
                <select
                  value={fxFrom}
                  onChange={(e) => setFxFrom(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="JPY">JPY — Japanese Yen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">To Currency</label>
                <select
                  value={fxTo}
                  onChange={(e) => setFxTo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="JPY">JPY — Japanese Yen</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount to Convert</label>
              <input
                type="number"
                value={fxAmount}
                onChange={(e) => setFxAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            {fxResult && (
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-blue-200">
                  <span>Exchange Rate:</span>
                  <span className="font-mono font-semibold">1 {fxFrom} = {fxResult.rate} {fxTo}</span>
                </div>
                <div className="flex items-center justify-between text-white font-bold text-base pt-2 border-t border-blue-800/40">
                  <span>You Receive:</span>
                  <span className="text-emerald-400">
                    {(fxResult.convertedAmountCents / 100).toFixed(2)} {fxTo}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4">Immutable Journal Activity Log</h3>
          <div className="divide-y divide-slate-800/60 text-xs">
            {journalEntries.map((j) => (
              <div key={j.id} className="py-3.5 flex items-center justify-between hover:bg-slate-800/20 px-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{j.description}</div>
                    <div className="font-mono text-[11px] text-slate-500 mt-0.5">{j.id} • {j.type}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-white">${(j.totalDebitCents / 100).toFixed(2)}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(j.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW VIRTUAL CARD MODAL */}
      {newCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Issue New Virtual Card</h3>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Brand</label>
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Type</label>
                  <select
                    value={cardFormFactor}
                    onChange={(e) => setCardFormFactor(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="GENERAL_PURPOSE">Standard Recurring</option>
                    <option value="SINGLE_USE">Burn on First Use</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monthly Spending Limit ($)</label>
                <input
                  type="number"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewCardModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition"
                >
                  Issue Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
