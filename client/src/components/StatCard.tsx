import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  gradient?: 'blue' | 'emerald' | 'purple' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  gradient = 'blue',
}) => {
  const gradientBorders = {
    blue: 'from-blue-500/20 to-transparent',
    emerald: 'from-emerald-500/20 to-transparent',
    purple: 'from-purple-500/20 to-transparent',
    amber: 'from-amber-500/20 to-transparent',
  };

  const iconBg = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card p-5 border border-slate-800/80 hover:border-slate-700 transition-all duration-200">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientBorders[gradient]}`} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${iconBg[gradient]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
