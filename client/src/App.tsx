import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { NotificationToast } from './components/NotificationToast';
import { MerchantPortal } from './views/MerchantPortal/MerchantPortal';
import { ConsumerPortal } from './views/ConsumerPortal/ConsumerPortal';
import { AdminConsole } from './views/AdminConsole/AdminConsole';
import { CheckoutDemo } from './views/CheckoutDemo/CheckoutDemo';
import { DeveloperDocs } from './views/DeveloperDocs/DeveloperDocs';
import { TreasuryConsole } from './views/TreasuryConsole/TreasuryConsole';
import { IsoMessageHub } from './views/IsoMessageHub/IsoMessageHub';
import { RailWorkbench } from './views/RailWorkbench/RailWorkbench';

export const AppContent: React.FC = () => {
  const { activePortal } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        {activePortal === 'merchant' && <MerchantPortal />}
        {activePortal === 'consumer' && <ConsumerPortal />}
        {activePortal === 'treasury' && <TreasuryConsole />}
        {activePortal === 'iso' && <IsoMessageHub />}
        {activePortal === 'rails' && <RailWorkbench />}
        {activePortal === 'admin' && <AdminConsole />}
        {activePortal === 'checkout' && <CheckoutDemo />}
        {activePortal === 'docs' && <DeveloperDocs />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 PayNexa Financial Technologies, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <span>PCI DSS Level 1 Certified</span>
            <span>ISO 20022 Compliant</span>
            <span>SOC 2 Type II</span>
          </div>
        </div>
      </footer>

      <NotificationToast />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
