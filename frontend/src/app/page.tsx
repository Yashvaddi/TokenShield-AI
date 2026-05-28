"use client";

import { Activity, ShieldAlert, Key, Zap, CheckCircle, TrendingUp, Cpu, Server, Globe, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useGetDashboardStatsQuery } from '@/store/apiSlice';

const trafficData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  tokens: 1000 + Math.random() * 5000,
  blocked: Math.floor(Math.random() * 200),
}));

const modelData = [
  { name: 'GPT-4', value: 45 },
  { name: 'Claude 3 Opus', value: 30 },
  { name: 'GPT-3.5', value: 15 },
  { name: 'Claude 3 Sonnet', value: 10 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const { data: rawStats, isLoading } = useGetDashboardStatsQuery({});

  const stats = rawStats || {
    tokens1m: 0,
    tokens1h: 0,
    costUsd: 0,
    predictedCostUsd: 0,
    anomalies: 0
  };

  if (isLoading) return <div className="p-12 text-white">Loading dashboard...</div>;

  return (
    <main className="min-h-screen p-8 lg:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <header className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            Analytics Overview
          </h1>
          <p className="text-slate-400 text-sm">Real-time LLM Governance & Resource Usage</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 relative z-10">
        <StatCard title="Tokens (1m)" value={stats.tokens1m.toLocaleString()} color="text-blue-400" />
        <StatCard title="Tokens (1h)" value={stats.tokens1h.toLocaleString()} color="text-indigo-400" />
        <StatCard title="Estimated Cost" value={`$${stats.costUsd.toFixed(2)}`} color="text-emerald-400" />
        <StatCard title="30-Day Forecast" value={`$${(stats.predictedCostUsd || 0).toFixed(2)}`} color="text-purple-400" />
        <StatCard title="Anomalies Blocked" value={stats.anomalies.toString()} color="text-rose-400" alert={stats.anomalies > 0} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 mb-6">
        <div className="glass-card p-6 lg:col-span-2 min-h-[400px] flex flex-col">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Live Traffic vs Mitigations
          </h2>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" name="Allowed Tokens" />
                <Area type="monotone" dataKey="blocked" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" name="Blocked Requests" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 min-h-[400px] flex flex-col">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Model Distribution
          </h2>
          <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modelData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {modelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Anomalies by Type
          </h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Spikes', count: 42 },
                { name: 'Injections', count: 18 },
                { name: 'Loops', count: 9 },
                { name: 'Keys', count: 2 },
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            System Health
          </h2>
          <div className="space-y-4">
            <HealthItem name="Anthropic API Gateway" status="operational" latency="42ms" />
            <HealthItem name="OpenAI API Gateway" status="operational" latency="58ms" />
            <HealthItem name="Redis Counters" status="operational" latency="1ms" />
            <HealthItem name="Threat Detection Engine" status="operational" latency="5ms" />
            <HealthItem name="Celery Alert Workers" status="warning" latency="Queue: 12" />
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, color, alert = false }: { title: string, value: string, color: string, alert?: boolean }) {
  return (
    <div className={`glass-card p-6 relative overflow-hidden transition-all duration-300 ${alert ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : ''}`}>
      {alert && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-2xl rounded-full"></div>}
      <h3 className="text-slate-400 font-medium text-xs mb-2 uppercase tracking-wider">{title}</h3>
      <div className={`text-4xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function HealthItem({ name, status, latency }: { name: string, status: string, latency: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full ${status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
        <span className="text-sm font-medium text-slate-200">{name}</span>
      </div>
      <span className="text-xs text-slate-500 font-mono">{latency}</span>
    </div>
  );
}
