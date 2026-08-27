import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ThreeDSecureModal } from '../../components/ThreeDSecureModal';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building,
  QrCode,
  ArrowRight,
} from 'lucide-react';

export const CheckoutDemo: React.FC = () => {
  const { addNotification, refreshData } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'ACH'>('CARD');
  const [amount, setAmount] = useState('125.00');
  const [currency, setCurrency] = useState('USD');

  // Card form
  const [cardNumber, setCardNumber] = useState('4532 0000 0000 0000');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('28');
  const [cvv, setCvv] = useState('123');
  const [holderName, setHolderName] = useState('Sarah Connor');

  // UPI Form
  const [upiVpa, setUpiVpa] = useState('sarah@okaxis');

  // ACH Form
  const [routingNumber, setRoutingNumber] = useState('121000358');
  const [accountNumber, setAccountNumber] = useState('9876543210');

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // 3DS Modal state
  const [threeDsModal, setThreeDsModal] = useState<{
    isOpen: boolean;
    intentId: string;
    amountCents: number;
    currency: string;
    otp: string;
  }>({
    isOpen: false,
    intentId: '',
    amountCents: 0,
    currency: 'USD',
    otp: '123456',
  });

  const testCards = [
    { label: '✅ Instant Success', pan: '4532 0000 0000 0000', desc: 'Frictionless Visa card' },
    { label: '🛡️ 3DS Challenge', pan: '4532 0000 0000 0002', desc: 'Triggers simulated OTP' },
    { label: '❌ Insufficient Funds', pan: '4532 0000 0000 0004', desc: 'Bank decline code 51' },
    { label: '🚫 Fraud Trigger', pan: '4532 0000 0000 0006', desc: 'Declined by risk scorecard' },
  ];

  const handleApplyPreset = (pan: string) => {
    setCardNumber(pan);
    setPaymentError(null);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    try {
      const amountCents = Math.round(parseFloat(amount) * 100);

      // 1. Create Payment Intent
      const intent = await api.createIntent({
        amountCents,
        currency,
        description: 'CyberStore Quantum Hardware Order #9842',
      });

      // 2. Confirm Payment Intent with Method
      let confirmPayload: any = { paymentMethodType: paymentMethod };

      if (paymentMethod === 'CARD') {
        confirmPayload.card = {
          cardNumber: cardNumber.replace(/\s/g, ''),
          expMonth: parseInt(expMonth, 10),
          expYear: parseInt(expYear, 10),
          cvv,
          holderName,
        };
      } else if (paymentMethod === 'UPI') {
        confirmPayload.upi = { vpa: upiVpa };
      } else if (paymentMethod === 'ACH') {
        confirmPayload.bank = {
          routingNumber,
          accountNumber,
          bankName: 'JPMorgan Chase Bank',
        };
      }

      const confirmed = await api.confirmIntent(intent.id, confirmPayload);

      // 3. Check if 3DS Action is required
      if (confirmed.status === 'REQUIRES_ACTION' && confirmed.threeDSecure) {
        setThreeDsModal({
          isOpen: true,
          intentId: confirmed.id,
          amountCents: confirmed.amountCents,
          currency: confirmed.currency,
          otp: confirmed.threeDSecure.otpCodeSimulator || '123456',
        });
        return;
      }

      if (confirmed.status === 'SUCCEEDED') {
        setPaymentSuccess(confirmed);
        refreshData();
        addNotification({
          type: 'success',
          title: 'Payment Succeeded',
          message: `Receipt generated for $${(amountCents / 100).toFixed(2)}.`,
        });
      }
    } catch (err: unknown) {
      setPaymentError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify3Ds = async (otpCode: string) => {
    const verified = await api.verify3Ds(threeDsModal.intentId, otpCode);
    setThreeDsModal((prev) => ({ ...prev, isOpen: false }));
    setPaymentSuccess(verified);
    refreshData();
    addNotification({
      type: 'success',
      title: '3DS Authenticated & Paid',
      message: 'Transaction successfully verified via Bank ACS simulator.',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hosted Checkout & Drop-in SDK Simulator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Interactive customer checkout demonstration supporting Cards, 3DS 2.2, UPI, and Bank Rails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              CS
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">CyberStore Nexus</h3>
              <p className="text-[11px] text-slate-400">Order #9842-NX</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">PayNexa Quantum Developer Node</div>
                  <div className="text-slate-500 text-[11px]">Hardware Acceleration Key</div>
                </div>
              </div>
              <span className="font-mono font-semibold text-white">${amount}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-white">${amount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Estimated Tax</span>
              <span className="font-mono text-white">$0.00</span>
            </div>
            <div className="flex items-center justify-between text-white font-bold text-base pt-2 border-t border-slate-800">
              <span>Total Due</span>
              <span className="font-mono text-emerald-400">${amount} {currency}</span>
            </div>
          </div>

          {/* Test Card Quick Selectors */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Quick Test Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {testCards.map((tc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(tc.pan)}
                  className="text-left p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-[11px] transition"
                >
                  <div className="font-semibold text-slate-200">{tc.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{tc.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Payment Widget */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
          {paymentSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Payment intent <code className="font-mono text-emerald-400">{paymentSuccess.id}</code> captured.
                </p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left font-mono text-xs text-slate-300 space-y-1">
                <div>Amount: ${(paymentSuccess.amountCents / 100).toFixed(2)} {paymentSuccess.currency}</div>
                <div>Status: {paymentSuccess.status}</div>
                <div>Risk Score: {paymentSuccess.riskScore || 15}/100</div>
                <div>Captured At: {new Date(paymentSuccess.capturedAt).toLocaleString()}</div>
              </div>
              <button
                onClick={() => {
                  setPaymentSuccess(null);
                  setPaymentError(null);
                }}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
              >
                Simulate Another Checkout
              </button>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-6">
              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'CARD', label: 'Credit Card', icon: CreditCard },
                  { id: 'UPI', label: 'Instant UPI', icon: QrCode },
                  { id: 'ACH', label: 'Bank Wire', icon: Building },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* CARD METHOD FORM */}
              {paymentMethod === 'CARD' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-blue-500 tracking-wider"
                      />
                      <CreditCard className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exp Month</label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-blue-500 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exp Year</label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-blue-500 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">CVV / CVC</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-blue-500 text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* UPI METHOD FORM */}
              {paymentMethod === 'UPI' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">UPI Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sarah@okaxis"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                    <div className="w-24 h-24 bg-white rounded-lg p-1.5 mx-auto flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-slate-900" />
                    </div>
                    <p className="text-[11px] text-slate-400">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
                  </div>
                </div>
              )}

              {/* ACH BANK TRANSFER FORM */}
              {paymentMethod === 'ACH' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bank Routing Transit Number (ABA)</label>
                    <input
                      type="text"
                      required
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Number</label>
                    <input
                      type="password"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {paymentError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  'Securing Transaction...'
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Pay ${amount} {currency}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3DS MODAL */}
      <ThreeDSecureModal
        isOpen={threeDsModal.isOpen}
        intentId={threeDsModal.intentId}
        amountCents={threeDsModal.amountCents}
        currency={threeDsModal.currency}
        simulatedOtp={threeDsModal.otp}
        onVerify={handleVerify3Ds}
        onCancel={() => setThreeDsModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
