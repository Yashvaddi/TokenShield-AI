"use client";

import { useState, useEffect } from 'react';
import { Activity, Search, Filter, AlertTriangle, ShieldAlert, Download, ArrowUpRight } from 'lucide-react';
import { useGetAnomaliesQuery } from '@/store/apiSlice';

export default function AnomaliesPage() {
  const { data: rawAnomalies, isLoading } = useGetAnomaliesQuery({});
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    if (rawAnomalies && rawAnomalies.length > 0) {
      setAnomalies(rawAnomalies);
    } else {
      // Mock initial data
      setAnomalies([
        { id: 'evt_9812', type: 'Prompt Injection', severity: 'critical', user: 'user_4f9a', ip: '192.168.1.45', time: new Date().toISOString(), action: 'Blocked' },
        { id: 'evt_9811', type: 'Volume Spike', severity: 'emergency', user: 'user_2b1c', ip: '10.0.0.12', time: new Date(Date.now() - 3600000).toISOString(), action: 'Rate Limited' },
      ]);
    }
  }, [rawAnomalies]);

  // SSE Subscription (TSH-052)
  useEffect(() => {
    const eventSource = new EventSource('/api/anomalies/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const newEvent = JSON.parse(event.data);
        const formattedEvent = {
          id: newEvent.event_id || `evt_${Math.floor(Math.random() * 10000)}`,
          type: newEvent.rule_name || 'Unknown Anomaly',
          severity: newEvent.severity || 'warning',
          user: newEvent.user_id || 'unknown',
          ip: newEvent.ip || 'N/A',
          time: new Date().toISOString(),
          action: newEvent.action_taken || 'Logged'
        };
        
        setAnomalies((prev) => [formattedEvent, ...prev]);
      } catch (err) {
        console.error("Failed to parse SSE event", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error", err);
      eventSource.close();
      // Auto-reconnect logic could go here
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (isLoading && anomalies.length === 0) return <div className="p-12 text-white">Loading anomalies...</div>;

  return (
    <main className="p-8 lg:p-12 relative overflow-hidden min-h-screen">
      <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] bg-rose-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
            Security Events & Anomalies
          </h1>
          <p className="text-slate-400 text-sm">Audit log of all detected LLM attacks and limit breaches</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 transition">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 transition">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      <div className="glass-card relative z-10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Event ID</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Anomaly Type</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Severity</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">User / IP</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Time</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300">Action Taken</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {anomalies.map((event: any) => (
              <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6">
                  <span className="font-mono text-sm text-slate-400">{event.id}</span>
                </td>
                <td className="py-4 px-6 font-medium text-slate-200">
                  {event.type}
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                    event.severity === 'emergency' ? 'bg-rose-600/20 text-rose-400 border-rose-500/30' :
                    event.severity === 'critical' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {event.severity}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-mono text-indigo-300">{event.user}</span>
                    <span className="text-xs text-slate-500">{event.ip}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-400 text-sm">{event.time}</td>
                <td className="py-4 px-6">
                  <span className="text-sm font-medium text-emerald-400">{event.action}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition">
                    <ArrowUpRight className="w-5 h-5" />
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
