import React from 'react';

interface CurrencyBadgeProps {
  currency: string;
}

export const CurrencyBadge: React.FC<CurrencyBadgeProps> = ({ currency }) => {
  const flags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    INR: '🇮🇳',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    SGD: '🇸🇬',
  };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-mono">
      <span>{flags[currency] || '🌐'}</span>
      <span>{currency}</span>
    </span>
  );
};
