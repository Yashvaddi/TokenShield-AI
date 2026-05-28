"use client";

import { CreditCard, CheckCircle2, Zap, ArrowRight, Download, Coins, Share2 } from 'lucide-react';
import { useState } from 'react';

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? '$49' : '$39',
      tokens: '5M Tokens/mo',
      features: ['Basic Threat Detection', '2 API Keys', 'Email Support', '7-day Log Retention'],
      popular: false,
    },
    {
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? '$199' : '$159',
      tokens: '50M Tokens/mo',
      features: ['Advanced EWMA Spikes', 'Unlimited API Keys', 'Priority Support', '30-day Log Retention', 'Slack/Discord Alerts'],
      popular: true,
    },
    {
      name: 'Scale',
      price: 'Custom',
      tokens: 'Unlimited Tokens',
      features: ['Dedicated Proxy IP', 'Custom Rules Engine', '24/7 Phone Support', 'Infinite Retention', 'SSO & SAML'],
      popular: false,
    }
  ];

  const invoices = [
    { id: 'INV-2024-03', date: 'Mar 1, 2024', amount: '$199.00', status: 'Paid' },
    { id: 'INV-2024-02', date: 'Feb 1, 2024', amount: '$199.00', status: 'Paid' },
    { id: 'INV-2024-01', date: 'Jan 1, 2024', amount: '$199.00', status: 'Paid' },
  ];

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen">
      <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            Billing & Subscriptions
          </h1>
          <p className="text-slate-400 text-sm">Manage your plan, limits, and payment methods</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 mb-12">
        {/* Current Plan Overview */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Enterprise Plan</h2>
                <p className="text-sm text-slate-400">Renews on April 1, 2024</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Monthly Token Usage</span>
                <span className="text-white font-medium">45M / 50M</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-[90%]"></div>
              </div>
              <p className="text-xs text-rose-400 mt-2 font-medium">You are approaching your monthly limit.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition">
              Upgrade Plan
            </button>
            <button className="px-5 py-2.5 bg-slate-800 text-white font-medium rounded-lg border border-white/10 hover:bg-slate-700 transition">
              Buy Add-on Credits
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            Payment Method
          </h2>
          <div className="flex-1">
            <div className="p-4 rounded-xl border border-white/10 bg-slate-800/50 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-700 rounded flex items-center justify-center text-xs font-bold text-white">VISA</div>
                <div>
                  <p className="text-sm font-medium text-white">•••• •••• •••• 4242</p>
                  <p className="text-xs text-slate-400">Expires 12/25</p>
                </div>
              </div>
            </div>
            <button className="w-full py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition">
              Update Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* Credits & Referral Program */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mb-12">
        {/* Credits System */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              Credits System (Pay-as-you-go)
            </h2>
            <p className="text-sm text-slate-400 mb-6">Prepaid credits are used for expensive multi-modal requests and usage overflow.</p>
            <div className="text-4xl font-extrabold text-white mb-2">125,000 <span className="text-sm text-slate-500 font-medium">CR</span></div>
            <p className="text-sm text-emerald-400 font-medium">Available AI Credits</p>
          </div>
          <button className="mt-6 w-full py-2.5 bg-slate-800 text-white font-medium rounded-lg border border-white/10 hover:bg-slate-700 transition">
            Buy Add-on Credits
          </button>
        </div>

        {/* Referral System */}
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-400" />
              Referral Program
            </h2>
            <p className="text-sm text-slate-400 mb-6">Earn 50,000 credits for every enterprise team that signs up using your link.</p>
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg p-2">
              <input type="text" readOnly value="https://tokenshield.ai/ref/alpha-team" className="bg-transparent text-sm text-slate-300 w-full focus:outline-none px-2" />
              <button className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded transition text-xs font-bold">COPY</button>
            </div>
          </div>
          <div className="relative z-10 mt-6 flex justify-between items-center border-t border-white/5 pt-4">
            <span className="text-sm text-slate-400">Total Earned:</span>
            <span className="text-sm font-bold text-emerald-400">150,000 CR</span>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="mb-12 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 p-1 rounded-lg flex border border-white/5">
            <button 
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly <span className="text-emerald-400 ml-1 text-xs">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`glass-card p-8 relative flex flex-col ${plan.popular ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              )}
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-slate-400">/mo</span>}
              </div>
              <p className="text-sm text-indigo-300 font-medium mb-6 pb-6 border-b border-white/10">{plan.tokens}</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                plan.popular 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                  : 'bg-slate-800 text-white border border-white/10 hover:bg-slate-700'
              }`}>
                {plan.name === 'Enterprise' ? 'Current Plan' : 'Select Plan'}
                {plan.name !== 'Enterprise' && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History */}
      <div className="glass-card relative z-10 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Invoice History</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Invoice ID</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Date</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Amount</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Status</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6 font-mono text-sm text-indigo-300">{inv.id}</td>
                <td className="py-4 px-6 text-sm text-slate-300">{inv.date}</td>
                <td className="py-4 px-6 text-sm font-medium text-white">{inv.amount}</td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {inv.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
