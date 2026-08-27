import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        let icon = <Info className="w-5 h-5 text-blue-400" />;
        let borderClass = 'border-blue-500/30 bg-blue-950/90 text-blue-100';

        if (n.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
          borderClass = 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100';
        } else if (n.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
          borderClass = 'border-amber-500/30 bg-amber-950/90 text-amber-100';
        } else if (n.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-400" />;
          borderClass = 'border-rose-500/30 bg-rose-950/90 text-rose-100';
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 ${borderClass}`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-white tracking-wide">{n.title}</div>
              <div className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">{n.message}</div>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
