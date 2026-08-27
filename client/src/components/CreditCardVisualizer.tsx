import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Snowflake, Lock, Flame, RefreshCw } from 'lucide-react';

interface CreditCardVisualizerProps {
  card: {
    id: string;
    panMasked: string;
    panEncrypted?: string;
    last4: string;
    cardholderName: string;
    expMonth: number;
    expYear: number;
    cvvEncrypted?: string;
    brand: string;
    status: string;
    currency: string;
    spendingLimits?: {
      perTransactionMaxCents: number;
      dailyMaxCents: number;
      monthlyMaxCents: number;
      currentMonthSpentCents: number;
    };
    isBurnOnUse?: boolean;
    formFactor?: string;
  };
  onToggleFreeze?: (id: string) => void;
}

export const CreditCardVisualizer: React.FC<CreditCardVisualizerProps> = ({ card, onToggleFreeze }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const isFrozen = card.status === 'FROZEN';
  const isBurn = card.isBurnOnUse || card.formFactor === 'SINGLE_USE';

  const displayNumber = showDetails && card.panEncrypted
    ? card.panEncrypted.replace(/(\d{4})/g, '$1 ').trim()
    : card.panMasked;

  const displayCvv = showDetails && card.cvvEncrypted ? card.cvvEncrypted : '•••';

  return (
    <div className="flex flex-col gap-4">
      {/* 3D Physical-look Virtual Card */}
      <div
        className={`relative w-full max-w-sm h-52 rounded-2xl p-6 text-white shadow-2xl transition-all duration-300 transform select-none overflow-hidden ${
          isFrozen
            ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-cyan-500/30'
            : isBurn
            ? 'bg-gradient-to-br from-amber-600 via-orange-700 to-slate-950 border border-orange-500/40 shadow-orange-950/40'
            : 'bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 border border-blue-500/30 shadow-blue-950/40'
        }`}
      >
        {/* Holographic background texture */}
        <div className="absolute inset-0 bg-radial-gradient opacity-20 pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        {/* Frozen Ice Overlay */}
        {isFrozen && (
          <div className="absolute inset-0 bg-cyan-950/60 backdrop-blur-xs flex items-center justify-center z-10 border border-cyan-500/40 rounded-2xl">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-900/80 border border-cyan-400 text-cyan-200 text-xs font-bold tracking-wider uppercase">
              <Snowflake className="w-4 h-4 animate-spin" /> Card Frozen
            </div>
          </div>
        )}

        {/* Top Row: Chip & Brand */}
        <div className="flex items-center justify-between relative z-5">
          <div className="flex items-center gap-2">
            {/* Metallic Smart Chip */}
            <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-200 border border-amber-500/50 shadow-inner flex flex-col justify-around p-1">
              <div className="w-full h-px bg-amber-700/40" />
              <div className="w-full h-px bg-amber-700/40" />
            </div>
            {/* Contactless Wave */}
            <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12a2.5 2.5 0 0 0-2.5-2.5" />
              <path d="M5.5 17.5A6.5 6.5 0 0 0 12 11a6.5 6.5 0 0 0-6.5-6.5" />
              <path d="M2.5 20.5A10.5 10.5 0 0 0 13 10a10.5 10.5 0 0 0-10.5-10.5" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            {isBurn && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-bold uppercase tracking-wider border border-orange-500/40">
                <Flame className="w-3 h-3" /> Burn Card
              </span>
            )}
            <span className="font-extrabold text-lg tracking-widest italic text-white/90">
              {card.brand === 'MASTERCARD' ? 'mastercard' : 'VISA'}
            </span>
          </div>
        </div>

        {/* Card Number */}
        <div className="mt-8 relative z-5">
          <div className="font-mono text-xl tracking-[0.2em] font-semibold text-white/95 drop-shadow-sm">
            {displayNumber}
          </div>
        </div>

        {/* Bottom Row: Holder, Expiry & CVV */}
        <div className="mt-6 flex items-end justify-between relative z-5 text-xs">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/60 font-semibold">Cardholder</div>
            <div className="font-semibold uppercase tracking-wider text-white/90 mt-0.5 truncate max-w-[160px]">
              {card.cardholderName}
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[9px] uppercase tracking-widest text-white/60 font-semibold">Expires</div>
              <div className="font-mono font-semibold text-white/90 mt-0.5">
                {String(card.expMonth).padStart(2, '0')}/{card.expYear}
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase tracking-widest text-white/60 font-semibold">CVV</div>
              <div className="font-mono font-semibold text-white/90 mt-0.5">{displayCvv}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls Bar */}
      <div className="flex items-center justify-between gap-2 max-w-sm px-1">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60 transition"
        >
          {showDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showDetails ? 'Hide PAN' : 'Reveal PAN'}
        </button>

        {onToggleFreeze && (
          <button
            onClick={() => onToggleFreeze(card.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
              isFrozen
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            {isFrozen ? 'Unfreeze Card' : 'Freeze Card'}
          </button>
        )}
      </div>
    </div>
  );
};
