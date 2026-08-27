import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (['SUCCEEDED', 'ACTIVE', 'VERIFIED', 'WON', 'PAID', 'APPROVE'].includes(normalized)) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (['REQUIRES_ACTION', 'PENDING', 'PENDING_REVIEW', 'WARNING_NEEDS_RESPONSE', 'UNDER_REVIEW', 'CHALLENGE_3DS'].includes(normalized)) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (['FAILED', 'FROZEN', 'REJECTED', 'LOST', 'CANCELED', 'DECLINE', 'CHARGED_BACK'].includes(normalized)) {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (['MANUAL_REVIEW', 'PROCESSING'].includes(normalized)) {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80 animate-pulse" />
      {normalized.replace(/_/g, ' ')}
    </span>
  );
};
