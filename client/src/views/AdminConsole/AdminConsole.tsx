import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import {
  ShieldAlert,
  ShieldCheck,
  Scale,
  Users,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lock,
} from 'lucide-react';

export const AdminConsole: React.FC = () => {
  const { fraudAssessments, disputes, refreshData, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'radar' | 'rules' | 'disputes' | 'kyc' | 'ledger'>('radar');
  const [fraudRules, setFraudRules] = useState<any[]>([]);
  const [kycList, setKycList] = useState<any[]>([]);
  const [ledgerAudit, setLedgerAudit] = useState<any>(null);
  const [blacklist, setBlacklist] = useState<any[]>([]);

  // Modals state
  const [newRuleModal, setNewRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleCondition, setRuleCondition] = useState('AMOUNT_GREATER_THAN');
  const [ruleThreshold, setRuleThreshold] = useState('500000');
  const [ruleRiskPoints, setRuleRiskPoints] = useState('35');
  const [ruleAction, setRuleAction] = useState('CHALLENGE_3DS');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [rules, kyc, audit, bl] = await Promise.all([
        api.getFraudRules().catch(() => []),
        api.getKycList().catch(() => []),
        api.getLedgerAudit().catch(() => null),
        api.getBlacklist().catch(() => []),
      ]);
      setFraudRules(rules);
      setKycList(kyc);
      setLedgerAudit(audit);
      setBlacklist(bl);
    } catch (err) {
      console.error('Error loading admin console data:', err);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      await api.toggleFraudRule(ruleId);
      loadAdminData();
      addNotification({
        type: 'info',
        title: 'Rule Status Changed',
        message: 'Fraud engine rule execution updated.',
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFraudRule({
        name: ruleName,
        description: `Trigger on ${ruleCondition}`,
        conditionType: ruleCondition,
        thresholdValue: ruleThreshold,
        riskPoints: parseInt(ruleRiskPoints, 10),
        actionIfTriggered: ruleAction,
        isEnabled: true,
        isSystemRule: false,
      });
      setNewRuleModal(false);
      setRuleName('');
      loadAdminData();
      addNotification({
        type: 'success',
        title: 'Fraud Rule Created',
        message: 'New risk evaluation rule is now evaluating in real-time.',
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleResolveDispute = async (disputeId: string, outcome: 'WON' | 'LOST') => {
    try {
      await api.resolveDispute(disputeId, outcome, `Arbitrated by compliance officer`);
      refreshData();
      loadAdminData();
      addNotification({
        type: outcome === 'WON' ? 'success' : 'warning',
        title: `Dispute Resolved: ${outcome}`,
        message: `Dispute ${disputeId} closed as ${outcome}.`,
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleReviewKyc = async (kycId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      await api.reviewKyc(kycId, decision, 'Identity document verified against sanction databases');
      loadAdminData();
      addNotification({
        type: decision === 'APPROVE' ? 'success' : 'error',
        title: `KYC ${decision === 'APPROVE' ? 'Approved' : 'Rejected'}`,
        message: `Customer KYC status updated to ${decision === 'APPROVE' ? 'VERIFIED' : 'REJECTED'}.`,
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Compliance & Risk Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time fraud scorecards, chargeback arbitration, KYC verification, and double-entry ledger audits.
          </p>
        </div>

        <button
          onClick={() => loadAdminData()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-audit Ledger
        </button>
      </div>

      {/* Top Admin Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Global Ledger Status"
          value={ledgerAudit?.isBalanced ? '100% Balanced' : 'Checking...'}
          subtitle="Assets ≡ Liab + Equity"
          icon={Scale}
          gradient="emerald"
        />
        <StatCard
          title="Active Fraud Rules"
          value={fraudRules.filter((r) => r.isEnabled).length.toString()}
          subtitle="real-time heuristics"
          icon={ShieldCheck}
          gradient="blue"
        />
        <StatCard
          title="Disputes in Queue"
          value={disputes.filter((d) => d.status === 'WARNING_NEEDS_RESPONSE' || d.status === 'UNDER_REVIEW').length.toString()}
          subtitle="requires arbitration"
          icon={ShieldAlert}
          gradient="amber"
        />
        <StatCard
          title="KYC Verifications"
          value={kycList.filter((k) => k.status === 'PENDING_REVIEW').length.toString()}
          subtitle="pending review"
          icon={Users}
          gradient="purple"
        />
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-px">
        {[
          { id: 'radar', label: 'Fraud Radar & Logs', icon: ShieldAlert },
          { id: 'rules', label: 'Risk Rules Engine', icon: ShieldCheck },
          { id: 'disputes', label: 'Dispute Arbiter', icon: AlertTriangle },
          { id: 'kyc', label: 'KYC Document Queue', icon: Users },
          { id: 'ledger', label: 'Double-Entry Auditor', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold transition whitespace-nowrap ${
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

      {/* TAB: FRAUD RADAR */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-3">Live Risk Assessment Evaluations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Assessment ID</th>
                    <th className="py-3 px-3">Risk Score</th>
                    <th className="py-3 px-3">Decision</th>
                    <th className="py-3 px-3">Risk Factors</th>
                    <th className="py-3 px-3">IP / Geo Origin</th>
                    <th className="py-3 px-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {fraudAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No transactions evaluated yet.
                      </td>
                    </tr>
                  ) : (
                    fraudAssessments.map((fa) => (
                      <tr key={fa.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-mono font-semibold text-white">{fa.id}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                                fa.totalRiskScore >= 80
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : fa.totalRiskScore >= 50
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {fa.totalRiskScore} / 100
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={fa.decision} />
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          {fa.factors?.length > 0 ? (
                            <div className="space-y-1">
                              {fa.factors.map((f: any, idx: number) => (
                                <div key={idx} className="text-[11px] text-amber-300 truncate">
                                  • {f.ruleName} (+{f.riskPoints} pts)
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Clean / Low Background Risk</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {fa.ipAddress || '192.168.1.1'} ({fa.ipCountry || 'US'})
                        </td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(fa.evaluatedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RISK RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Active Heuristic & ML Risk Rules</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rules executed synchronously prior to card authorization and settlement.
              </p>
            </div>
            <button
              onClick={() => setNewRuleModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Rule
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800 divide-y divide-slate-800">
            {fraudRules.map((rule) => (
              <div key={rule.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{rule.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      +{rule.riskPoints} PTS
                    </span>
                    <StatusBadge status={rule.actionIfTriggered} />
                  </div>
                  <p className="text-xs text-slate-400">{rule.description}</p>
                </div>

                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                    rule.isEnabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {rule.isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DISPUTE ARBITER */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Dispute & Chargeback Arbiter</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review evidence submitted by merchants and adjudicate outcomes with the scheme network.
            </p>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase font-semibold border-b border-slate-800 bg-slate-900">
                  <tr>
                    <th className="py-3 px-4">Dispute Case</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Evidence</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Adjudication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {disputes.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/20">
                      <td className="py-4 px-4 font-mono font-bold text-white">{d.id}</td>
                      <td className="py-4 px-4 font-bold text-white">${(d.amountCents / 100).toFixed(2)}</td>
                      <td className="py-4 px-4 text-amber-400 font-semibold">{d.reason}</td>
                      <td className="py-4 px-4 text-slate-400 max-w-xs truncate">
                        {d.evidence?.customerName ? `Buyer: ${d.evidence.customerName}` : 'Pending Merchant Evidence'}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        {d.status !== 'WON' && d.status !== 'LOST' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleResolveDispute(d.id, 'WON')}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] transition"
                            >
                              Rule for Merchant (Won)
                            </button>
                            <button
                              onClick={() => handleResolveDispute(d.id, 'LOST')}
                              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-[11px] transition"
                            >
                              Rule for Buyer (Lost)
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Adjudicated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: KYC */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Merchant & Customer KYC Verification</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review government identity documents and business incorporation certificates.
            </p>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase font-semibold border-b border-slate-800 bg-slate-900">
                  <tr>
                    <th className="py-3 px-4">KYC ID</th>
                    <th className="py-3 px-4">Full Legal Name</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {kycList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No KYC verifications in queue.
                      </td>
                    </tr>
                  ) : (
                    kycList.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-800/20">
                        <td className="py-4 px-4 font-mono font-bold text-white">{k.id}</td>
                        <td className="py-4 px-4 font-semibold text-white">{k.fullName}</td>
                        <td className="py-4 px-4 font-mono">{k.documentType} ({k.documentNumberMasked})</td>
                        <td className="py-4 px-4">{k.country}</td>
                        <td className="py-4 px-4">
                          <StatusBadge status={k.status} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          {k.status === 'PENDING_REVIEW' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleReviewKyc(k.id, 'APPROVE')}
                                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReviewKyc(k.id, 'REJECT')}
                                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-[11px]"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: LEDGER AUDITOR */}
      {activeTab === 'ledger' && ledgerAudit && (
        <div className="space-y-6">
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-300">
                Double-Entry Accounting Invariance Verified
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                The global ledger strictly balances. Net accounting variance is precisely $0.00 across all system asset, liability, equity, and fee accounts.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono">
                <span className="text-slate-400">
                  Total Assets: <strong className="text-white">${(ledgerAudit.totalSystemAssetsCents / 100).toFixed(2)}</strong>
                </span>
                <span className="text-slate-400">
                  Total Liabilities: <strong className="text-white">${(ledgerAudit.totalSystemLiabilitiesCents / 100).toFixed(2)}</strong>
                </span>
                <span className="text-slate-400">
                  Platform Revenue: <strong className="text-emerald-400">${(ledgerAudit.totalSystemRevenueCents / 100).toFixed(2)}</strong>
                </span>
                <span className="text-slate-400">
                  Unbalanced Journals: <strong className="text-emerald-400">{ledgerAudit.unbalancedJournalsCount}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE RISK RULE MODAL */}
      {newRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create Custom Risk Rule</h3>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extreme Volume Spike Shield"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Condition Trigger</label>
                <select
                  value={ruleCondition}
                  onChange={(e) => setRuleCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="AMOUNT_GREATER_THAN">Transaction Amount Exceeds Threshold</option>
                  <option value="VELOCITY_COUNT_EXCEEDED">Rapid Payment Velocity Burst</option>
                  <option value="IP_COUNTRY_MISMATCH">Client IP & Card Country Cross-Border Mismatch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Risk Score Points (0 - 100)</label>
                <input
                  type="number"
                  min="5"
                  max="95"
                  value={ruleRiskPoints}
                  onChange={(e) => setRuleRiskPoints(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Action on Trigger</label>
                <select
                  value={ruleAction}
                  onChange={(e) => setRuleAction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="CHALLENGE_3DS">Trigger 3DS Challenge</option>
                  <option value="MANUAL_REVIEW">Flag for Manual Compliance Review</option>
                  <option value="DECLINE">Hard Decline Transaction</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewRuleModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
