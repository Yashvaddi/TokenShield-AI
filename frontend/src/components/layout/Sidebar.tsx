"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Key, ShieldAlert, Activity, Settings, Zap, MessageSquareText, CreditCard, FileText, Building2, Database, Workflow, ShieldCheck, Users } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Workspaces', href: '/workspaces', icon: Building2 },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Knowledge Base', href: '/knowledge', icon: Database },
  { name: 'Agent Workflows', href: '/workflows', icon: Workflow },
  { name: 'AI Chat', href: '/chat', icon: MessageSquareText },
  { name: 'Prompt Library', href: '/prompts', icon: FileText },
  { name: 'API Keys', href: '/keys', icon: Key },
  { name: 'Alert Rules', href: '/rules', icon: ShieldAlert },
  { name: 'Anomalies', href: '/anomalies', icon: Activity },
  { name: 'Audit Logs', href: '/audit', icon: ShieldCheck },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f172a]/80 backdrop-blur-xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <Zap className="w-5 h-5 text-white fill-white/20" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
          TokenShield
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "text-white bg-blue-600/10 border border-blue-500/20 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
              <Icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Enterprise Plan</h4>
        <div className="w-full bg-slate-950 rounded-full h-1.5 mb-1">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <p className="text-xs text-slate-500">45M / 100M Tokens</p>
      </div>
    </aside>
  );
}
