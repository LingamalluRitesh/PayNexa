import React from 'react';
import { useApp, PortalType } from '../context/AppContext';
import {
  CreditCard,
  LayoutDashboard,
  Wallet,
  ShieldAlert,
  Code2,
  RefreshCw,
  Zap,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activePortal, setActivePortal, currentUser, setCurrentUser, isConnected, refreshData } = useApp();

  const portals: Array<{ id: PortalType; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'merchant', label: 'Merchant Hub', icon: LayoutDashboard },
    { id: 'consumer', label: 'Consumer Wallet', icon: Wallet },
    { id: 'admin', label: 'Compliance & Risk', icon: ShieldAlert },
    { id: 'checkout', label: 'Hosted Checkout', icon: CreditCard },
    { id: 'docs', label: 'API & Sandbox', icon: Code2 },
  ];

  const demoUsers = [
    {
      id: 'usr_alex_chen',
      name: 'Alex Chen',
      email: 'alex.chen@acmecommerce.io',
      role: 'MERCHANT_OWNER',
      merchantId: 'merch_demo_1',
    },
    {
      id: 'usr_sarah_connor',
      name: 'Sarah Connor',
      email: 'sarah.c@cyberdyne.net',
      role: 'CONSUMER',
    },
    {
      id: 'usr_compliance_admin',
      name: 'Elena Rostova',
      email: 'elena.compliance@paynexa.io',
      role: 'COMPLIANCE_OFFICER',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400 fill-blue-400/20" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              PayNexa
            </span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Core 2.0
            </span>
          </div>
        </div>

        {/* Portals Switcher Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 p-1 rounded-xl">
          {portals.map((p) => {
            const Icon = p.icon;
            const isActive = activePortal === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePortal(p.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status & Profile Controls */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
            title={isConnected ? 'Real-time WebSocket connected' : 'Connecting to WebSocket...'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline">{isConnected ? 'LIVE WS' : 'CONNECTING'}</span>
          </div>

          {/* Refresh Data */}
          <button
            onClick={() => refreshData()}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Refresh All State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Profile / Role Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-medium transition">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline truncate max-w-[100px]">{currentUser?.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-1.5 hidden group-hover:block z-50">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                Switch Demo Persona
              </div>
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex flex-col transition ${
                    currentUser.id === u.id
                      ? 'bg-blue-600/20 text-blue-300 font-medium'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-semibold">{u.name}</span>
                  <span className="text-[10px] text-slate-400">{u.role.replace(/_/g, ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Portal Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950 px-2 py-1.5 overflow-x-auto">
        {portals.map((p) => {
          const Icon = p.icon;
          const isActive = activePortal === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePortal(p.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
