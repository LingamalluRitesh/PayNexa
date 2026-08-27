import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ThreeDSecureModalProps {
  isOpen: boolean;
  intentId: string;
  amountCents: number;
  currency: string;
  simulatedOtp?: string;
  onVerify: (otp: string) => Promise<void>;
  onCancel: () => void;
}

export const ThreeDSecureModal: React.FC<ThreeDSecureModalProps> = ({
  isOpen,
  intentId,
  amountCents,
  currency,
  simulatedOtp = '123456',
  onVerify,
  onCancel,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (!isOpen) {
      setOtp('');
      setError(null);
      setTimeLeft(300);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onVerify(otp);
    } catch (err: unknown) {
      setError((err as Error).message || 'Verification failed. Please check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Bank Header Bar */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 border-b border-blue-700/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white tracking-wide text-sm">3D Secure 2.2 Authentication</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-blue-200 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
            ACS Verified
          </span>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 mb-5">
            <div>
              <p className="text-xs text-slate-400 font-medium">Authorizing Payment</p>
              <p className="text-xl font-bold text-white mt-0.5">
                ${(amountCents / 100).toFixed(2)} {currency}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium">Session Timeout</p>
              <p className="text-xs font-mono font-semibold text-amber-400 mt-0.5">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Simulated SMS notification bubble */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-5 text-xs text-blue-300 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-blue-200">Sandbox Test Verification: </span>
              A one-time passcode has been sent to your registered phone. Use test code{' '}
              <span className="font-mono font-bold bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-400 text-white">
                {simulatedOtp}
              </span>{' '}
              to approve.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Enter 6-Digit One-Time Passcode
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder:text-slate-600 outline-none transition"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? 'Authenticating...' : 'Authorize Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
