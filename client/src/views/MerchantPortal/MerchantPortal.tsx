import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { CurrencyBadge } from '../../components/CurrencyBadge';
import {
  DollarSign,
  TrendingUp,
  Percent,
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  Webhook,
  Key,
  Repeat,
  ShieldAlert,
  Send,
  Plus,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

export const MerchantPortal: React.FC = () => {
  const { paymentIntents, webhookLogs, disputes, refreshData, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'payments' | 'subscriptions' | 'webhooks' | 'apikeys' | 'disputes'>('payments');
  const [metrics, setMetrics] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [refundModal, setRefundModal] = useState<{ isOpen: boolean; intent: any | null }>({ isOpen: false, intent: null });
  const [refundReason, setRefundReason] = useState('REQUESTED_BY_CUSTOMER');
  const [refundAmount, setRefundAmount] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'SECRET' | 'PUBLISHABLE'>('SECRET');
  const [createdKeyRaw, setCreatedKeyRaw] = useState<string | null>(null);

  const [newPlanModal, setNewPlanModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planAmount, setPlanAmount] = useState('');
  const [planInterval, setPlanInterval] = useState<'MONTH' | 'YEAR'>('MONTH');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadMerchantData();
  }, []);

  const loadMerchantData = async () => {
    try {
      const [m, p, s, k, ep] = await Promise.all([
        api.getPlatformMetrics().catch(() => null),
        api.getPlans().catch(() => []),
        api.getSubscriptions().catch(() => []),
        api.getApiKeys().catch(() => []),
        api.getWebhookEndpoints().catch(() => []),
      ]);
      setMetrics(m);
      setPlans(p);
      setSubscriptions(s);
      setApiKeys(k);
      setEndpoints(ep);
    } catch (err) {
      console.error('Error loading merchant portal data:', err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createApiKey({
        name: newKeyName || 'Production API Key',
        type: newKeyType,
        environment: 'LIVE',
      });
      setCreatedKeyRaw(created.rawKey);
      loadMerchantData();
      addNotification({
        type: 'success',
        title: 'API Key Created',
        message: 'Copy your API key now. It will not be shown again.',
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPlan({
        name: planName,
        amountCents: Math.round(parseFloat(planAmount) * 100),
        currency: 'USD',
        interval: planInterval,
      });
      setNewPlanModal(false);
      setPlanName('');
      setPlanAmount('');
      loadMerchantData();
      addNotification({
        type: 'success',
        title: 'Subscription Plan Created',
        message: `Plan ${planName} is now active for customer enrollments.`,
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleProcessRefund = async () => {
    if (!refundModal.intent) return;
    setIsSubmittingRefund(true);
    try {
      const amountCents = refundAmount ? Math.round(parseFloat(refundAmount) * 100) : refundModal.intent.amountCents;
      await api.refundIntent(refundModal.intent.id, {
        amountCents,
        reason: refundReason,
      });
      setRefundModal({ isOpen: false, intent: null });
      setRefundAmount('');
      refreshData();
      loadMerchantData();
      addNotification({
        type: 'success',
        title: 'Refund Processed',
        message: `Successfully refunded $${(amountCents / 100).toFixed(2)} to cardholder.`,
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const handleReplayWebhook = async (logId: string) => {
    try {
      await api.replayWebhook(logId);
      refreshData();
      addNotification({
        type: 'info',
        title: 'Webhook Replayed',
        message: 'Webhook payload re-dispatched to endpoint.',
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleSendTestPing = async () => {
    try {
      await api.sendTestWebhookPing();
      refreshData();
      addNotification({
        type: 'success',
        title: 'Test Webhook Dispatched',
        message: 'Dispatched signed payment_intent.succeeded test event to registered endpoints.',
      });
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // Filtering payments
  const filteredIntents = paymentIntents.filter((pi) => {
    const matchesSearch =
      pi.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pi.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pi.metadata?.orderId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || pi.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Merchant Title & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Acme Commerce — Merchant Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time payment gateway orchestration, double-entry settlement, and developer webhooks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSendTestPing()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs font-semibold text-slate-200 transition"
          >
            <Send className="w-3.5 h-3.5 text-blue-400" />
            <span>Test Webhook Ping</span>
          </button>
          <button
            onClick={() => setNewKeyModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create API Key</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Payment Volume (TPV)"
          value={metrics ? `$${((metrics.totalPaymentVolumeCents || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00'}
          change="+18.4%"
          subtitle="vs last month"
          icon={DollarSign}
          gradient="blue"
        />
        <StatCard
          title="Net Revenue (Platform)"
          value={metrics ? `$${((metrics.netRevenueCents || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00'}
          change="+12.1%"
          subtitle="processing fees"
          icon={TrendingUp}
          gradient="emerald"
        />
        <StatCard
          title="Success Rate"
          value={metrics ? `${metrics.successRatePercentage}%` : '100%'}
          change="+0.8%"
          subtitle="frictionless checkout"
          icon={Percent}
          gradient="purple"
        />
        <StatCard
          title="Active Subscriptions"
          value={subscriptions.length.toString()}
          subtitle="recurring billing"
          icon={Repeat}
          gradient="amber"
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-px">
        {[
          { id: 'payments', label: 'Payments & Transactions', icon: CreditCard },
          { id: 'subscriptions', label: 'Subscriptions & MRR', icon: Repeat },
          { id: 'webhooks', label: 'Webhooks & Deliveries', icon: Webhook },
          { id: 'apikeys', label: 'API Keys & Secrets', icon: Key },
          { id: 'disputes', label: 'Disputes & Chargebacks', icon: ShieldAlert },
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

      {/* TAB CONTENT: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search payment intent ID, order ID, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCEEDED">Succeeded</option>
                <option value="REQUIRES_ACTION">Requires 3DS</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Payment Intent</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Risk Score</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {filteredIntents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                        No payment transactions match your query.
                      </td>
                    </tr>
                  ) : (
                    filteredIntents.map((intent) => (
                      <tr key={intent.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-4">
                          <div className="font-mono text-white">{intent.id}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{intent.description}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-white font-bold">
                            ${(intent.amountCents / 100).toFixed(2)}
                          </div>
                          <div className="mt-0.5">
                            <CurrencyBadge currency={intent.currency} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                            {intent.paymentMethodType || 'CARD'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={intent.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                (intent.riskScore || 0) > 75
                                  ? 'bg-rose-400'
                                  : (intent.riskScore || 0) > 40
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            <span className="font-mono text-xs">{intent.riskScore || 15}/100</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                          {new Date(intent.createdAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {intent.status === 'SUCCEEDED' ? (
                            <button
                              onClick={() => setRefundModal({ isOpen: true, intent })}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition"
                            >
                              Refund
                            </button>
                          ) : (
                            <span className="text-slate-600 text-[11px]">—</span>
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

      {/* TAB CONTENT: SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Active Subscription Plans</h3>
              <p className="text-xs text-slate-400 mt-0.5">Recurring billing tiers configured for your merchant account.</p>
            </div>
            <button
              onClick={() => setNewPlanModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Create Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {plan.interval}LY
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">Active</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-3">{plan.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{plan.description || 'Full tier subscription'}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-baseline justify-between">
                  <div className="text-2xl font-extrabold text-white">
                    ${(plan.amountCents / 100).toFixed(2)}
                    <span className="text-xs text-slate-400 font-normal"> / {plan.interval.toLowerCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800 mt-6">
            <h4 className="text-sm font-bold text-white mb-3">Enrolled Customer Subscriptions</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase font-semibold border-b border-slate-800 pb-2">
                  <tr>
                    <th className="py-2">Subscription ID</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Plan</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Next Renewal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/20">
                      <td className="py-3 font-mono">{sub.id}</td>
                      <td className="py-3">{sub.customerId}</td>
                      <td className="py-3 font-semibold">{sub.planId}</td>
                      <td className="py-3">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Webhook Endpoints & Logs</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographically signed (HMAC-SHA256) event delivery with exponential backoff retries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endpoints.map((ep) => (
              <div key={ep.id} className="glass-card rounded-2xl p-5 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-400">{ep.id}</span>
                  <StatusBadge status={ep.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>
                <div className="font-mono text-xs text-slate-200 mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 truncate">
                  {ep.url}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Failures: {ep.failureCount}</span>
                  <span>Secret: <code className="text-slate-300 font-mono">whsec_••••••••</code></span>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-3">Live Webhook Delivery History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">HTTP Status</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Signature (v1)</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {webhookLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No webhook deliveries recorded yet.
                      </td>
                    </tr>
                  ) : (
                    webhookLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-mono text-blue-300 font-semibold">{log.eventType}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                              log.isSuccess ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {log.httpStatus || 200}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{log.responseTimeMs || 12}ms</td>
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                          {log.signatureHeader}
                        </td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.deliveredAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleReplayWebhook(log.id)}
                            className="flex items-center gap-1 ml-auto text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700"
                          >
                            <RotateCcw className="w-3 h-3" /> Replay
                          </button>
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

      {/* TAB CONTENT: API KEYS */}
      {activeTab === 'apikeys' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Developer API Credentials</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Use your secret keys to authenticate backend API requests and publishable keys for client SDK checkouts.
              </p>
            </div>
            <button
              onClick={() => setNewKeyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Generate Key
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800 divide-y divide-slate-800">
            {apiKeys.map((k) => (
              <div key={k.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{k.name}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        k.type === 'SECRET'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {k.type} KEY
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-400 mt-1">{k.keyRedacted}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(k.keyRedacted, k.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                  >
                    {copiedKey === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === k.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Disputes & Chargebacks</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer chargebacks initiated via issuing bank networks with automated reserve hold tracking.
            </p>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Dispute ID</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Due Date</th>
                    <th className="px-5 py-3 text-right">Reserve Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {disputes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                        No disputes opened against your merchant account.
                      </td>
                    </tr>
                  ) : (
                    disputes.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/20">
                        <td className="px-5 py-4 font-mono font-semibold text-white">{d.id}</td>
                        <td className="px-5 py-4 font-bold text-white">${(d.amountCents / 100).toFixed(2)}</td>
                        <td className="px-5 py-4 font-semibold text-amber-400">{d.reason}</td>
                        <td className="px-5 py-4">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {new Date(d.dueByDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Reserve Held ($140.00)
                          </span>
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

      {/* REFUND MODAL */}
      {refundModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Refund Payment</h3>
            <p className="text-xs text-slate-400">
              Refunding payment <code className="font-mono text-blue-400">{refundModal.intent?.id}</code> of $
              {((refundModal.intent?.amountCents || 0) / 100).toFixed(2)}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Refund Amount ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder={((refundModal.intent?.amountCents || 0) / 100).toFixed(2)}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Refund Reason</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="REQUESTED_BY_CUSTOMER">Customer Requested</option>
                <option value="DUPLICATE">Duplicate Charge</option>
                <option value="FRAUDULENT">Suspected Fraud</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setRefundModal({ isOpen: false, intent: null })}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={isSubmittingRefund}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition disabled:opacity-50"
              >
                {isSubmittingRefund ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE API KEY MODAL */}
      {newKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Generate API Key</h3>

            {createdKeyRaw ? (
              <div className="space-y-3">
                <p className="text-xs text-emerald-400 font-semibold">
                  API Key generated successfully! Copy this key now as it will never be displayed again.
                </p>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white break-all flex items-center justify-between gap-2">
                  <span>{createdKeyRaw}</span>
                  <button
                    onClick={() => handleCopy(createdKeyRaw, 'new_key')}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                  >
                    {copiedKey === 'new_key' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setNewKeyModal(false);
                    setCreatedKeyRaw(null);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production Backend Service"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Type</label>
                  <select
                    value={newKeyType}
                    onChange={(e) => setNewKeyType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="SECRET">Secret Key (sk_live_...)</option>
                    <option value="PUBLISHABLE">Publishable Key (pk_live_...)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setNewKeyModal(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition"
                  >
                    Generate
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {newPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create Subscription Plan</h3>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud Suite"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="99.00"
                  value={planAmount}
                  onChange={(e) => setPlanAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Billing Interval</label>
                <select
                  value={planInterval}
                  onChange={(e) => setPlanInterval(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="MONTH">Monthly</option>
                  <option value="YEAR">Yearly</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewPlanModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
