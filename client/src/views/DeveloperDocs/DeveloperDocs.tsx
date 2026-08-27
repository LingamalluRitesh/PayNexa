import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Play,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  Layers,
  Webhook,
} from 'lucide-react';

export const DeveloperDocs: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'typescript' | 'python' | 'curl'>('typescript');
  const [activeEndpoint, setActiveEndpoint] = useState<string>('create_payment_intent');
  const [liveResponse, setLiveResponse] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints = [
    {
      id: 'create_payment_intent',
      name: 'Create Payment Intent',
      method: 'POST',
      path: '/api/v1/payments/intents',
      description: 'Creates a new payment intent with automatic fee calculation and initial risk evaluation.',
      reqBody: {
        amountCents: 5000,
        currency: 'USD',
        description: 'E-commerce order checkout',
      },
    },
    {
      id: 'issue_card',
      name: 'Issue Virtual Card',
      method: 'POST',
      path: '/api/v1/cards',
      description: 'Generates a Luhn-compliant virtual Visa or Mastercard with customizable velocity limits.',
      reqBody: {
        cardholderName: 'Alex Chen',
        brand: 'VISA',
        spendingLimits: {
          monthlyMaxCents: 500000,
        },
      },
    },
    {
      id: 'audit_ledger',
      name: 'Audit Global Ledger Invariance',
      method: 'GET',
      path: '/api/v1/ledger/audit',
      description: 'Performs a live mathematical audit proving Assets = Liabilities + Equity + Revenue.',
    },
    {
      id: 'list_fraud_rules',
      name: 'List Active Risk Rules',
      method: 'GET',
      path: '/api/v1/fraud/rules',
      description: 'Fetches all enabled real-time fraud scorecard rules.',
    },
  ];

  const current = endpoints.find((e) => e.id === activeEndpoint) || endpoints[0];

  const handleRunRequest = async () => {
    setIsRunning(true);
    setLiveResponse(null);
    try {
      const resp = await fetch(current.path, {
        method: current.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk_live_demo_acme_master_secret_2026',
        },
        body: current.reqBody ? JSON.stringify(current.reqBody) : undefined,
      });
      const data = await resp.json();
      setLiveResponse({
        status: resp.status,
        headers: {
          'content-type': resp.headers.get('content-type'),
          'x-request-id': resp.headers.get('x-request-id'),
        },
        data,
      });
    } catch (err: unknown) {
      setLiveResponse({ error: (err as Error).message });
    } finally {
      setIsRunning(false);
    }
  };

  const getCodeSnippet = () => {
    if (selectedLanguage === 'typescript') {
      return `import { PayNexa } from '@paynexa/sdk';

const paynexa = new PayNexa({ apiKey: 'sk_live_...' });

${
  current.id === 'create_payment_intent'
    ? `const intent = await paynexa.payments.create({
  amountCents: 5000,
  currency: 'USD',
  description: 'E-commerce order checkout'
});
console.log('Client Secret:', intent.clientSecret);`
    : current.id === 'issue_card'
    ? `const card = await paynexa.cards.create({
  cardholderName: 'Alex Chen',
  brand: 'VISA',
  spendingLimits: { monthlyMaxCents: 500000 }
});
console.log('Issued Card:', card.panMasked);`
    : `const audit = await paynexa.ledger.audit();
console.log('Ledger Balanced:', audit.isBalanced);`
}`;
    }

    if (selectedLanguage === 'python') {
      return `from paynexa import PayNexa

client = PayNexa(api_key="sk_live_...")

${
  current.id === 'create_payment_intent'
    ? `intent = client.payments.create(
    amount_cents=5000,
    currency="USD",
    metadata={"order_id": "9842"}
)
print("Payment Intent ID:", intent["id"])`
    : current.id === 'issue_card'
    ? `card = client.cards.create(
    cardholder_name="Alex Chen",
    currency="USD"
)
print("Virtual Card:", card["panMasked"])`
    : `audit = client.ledger.audit()
print("Balanced:", audit["isBalanced"])`
}`;
    }

    return `curl -X ${current.method} http://localhost:4000${current.path} \\
  -H "Authorization: Bearer sk_live_demo_acme_master_secret_2026" \\
  -H "Content-Type: application/json" ${
    current.reqBody ? `\\\n  -d '${JSON.stringify(current.reqBody, null, 2)}'` : ''
  }`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          API Explorer & Developer Reference
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Interactive REST sandbox with official TypeScript & Python SDK code generation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Endpoint List */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Available Endpoints
          </div>
          {endpoints.map((ep) => (
            <button
              key={ep.id}
              onClick={() => {
                setActiveEndpoint(ep.id);
                setLiveResponse(null);
              }}
              className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between text-xs ${
                activeEndpoint === ep.id
                  ? 'bg-blue-600/15 border border-blue-500/40 text-blue-300 font-semibold'
                  : 'hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <div>
                <div className="text-white font-medium">{ep.name}</div>
                <div className="font-mono text-[10px] text-slate-500 mt-0.5">{ep.path}</div>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                  ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {ep.method}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Code Generator & Live Runner */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-xs">
                    {current.method}
                  </span>
                  <span className="font-mono text-sm font-semibold text-white">{current.path}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{current.description}</p>
              </div>

              <button
                onClick={handleRunRequest}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 self-start sm:self-auto"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isRunning ? 'Executing...' : 'Try It Out'}</span>
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['typescript', 'python', 'curl'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
                      selectedLanguage === lang ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
              </button>
            </div>

            {/* Code snippet block */}
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-300 overflow-x-auto">
              <code>{getCodeSnippet()}</code>
            </pre>
          </div>

          {/* Live Response Panel */}
          {liveResponse && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Live HTTP Response
                </h4>
                {liveResponse.status && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                    HTTP {liveResponse.status} OK
                  </span>
                )}
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-96">
                <code>{JSON.stringify(liveResponse.data || liveResponse, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
