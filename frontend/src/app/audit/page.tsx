"use client";

import { ShieldCheck, Search, Filter, Download, User, ArrowRight, Calendar } from 'lucide-react';
import { useState } from 'react';

import { useGetAuditLogsQuery } from '@/store/apiSlice';

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: rawLogs, isLoading } = useGetAuditLogsQuery({});
  const logs = rawLogs || [];

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen">
      <div className="absolute top-[20%] left-[60%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            Compliance & Audit Logs
          </h1>
          <p className="text-slate-400 text-sm">Immutable ledger of all administrative actions for SOC2 & GDPR</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-slate-800 text-white border border-white/10 hover:bg-slate-700 transition">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-500 transition">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      <div className="glass-card p-0 flex flex-col overflow-hidden relative z-10">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search actor or resource..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 w-full sm:w-64 shadow-inner"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition border border-white/5">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">Timestamp</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">Action</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">Actor</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">Target Resource</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300">IP Address</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 text-sm text-slate-400 whitespace-nowrap">
                    {log.time}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <User className="w-4 h-4 text-slate-500" />
                      {log.actor}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <ArrowRight className="w-4 h-4 text-slate-600" />
                      <span className="font-mono text-xs">{log.resource}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-mono text-slate-500">
                    {log.ip}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
