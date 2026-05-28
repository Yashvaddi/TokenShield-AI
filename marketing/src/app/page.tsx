"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Shield, Zap, Bot, Database, Server, Settings, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          >
            Build AI Automations Faster <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">With Enterprise Security</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Launch AI agents, workflows, and chat systems in minutes while ensuring zero-trust governance and cost protection.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="/contact" className="px-8 py-4 rounded-full text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition w-full sm:w-auto text-center">
              Start Free Trial
            </a>
            <a href="/contact" className="px-8 py-4 rounded-full text-base font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition w-full sm:w-auto text-center">
              Book a Demo
            </a>
          </motion.div>

          {/* DASHBOARD MOCKUP */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent z-10 pointer-events-none"></div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md p-2 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
              <div className="bg-slate-950 rounded-xl overflow-hidden border border-white/5 aspect-[16/9] flex items-center justify-center relative">
                {/* Fake UI */}
                <div className="absolute inset-4 grid grid-cols-4 grid-rows-3 gap-4 opacity-70">
                  <div className="col-span-1 row-span-3 bg-white/5 rounded-lg border border-white/5"></div>
                  <div className="col-span-3 row-span-2 bg-white/5 rounded-lg border border-white/5 flex flex-col p-4">
                    <div className="w-1/3 h-4 bg-white/10 rounded mb-4"></div>
                    <div className="flex-1 w-full flex items-end gap-2">
                       {[...Array(20)].map((_, i) => (
                         <div key={i} className="w-full bg-blue-500/20 rounded-t" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                       ))}
                    </div>
                  </div>
                  <div className="col-span-1 row-span-1 bg-white/5 rounded-lg border border-white/5"></div>
                  <div className="col-span-1 row-span-1 bg-white/5 rounded-lg border border-white/5"></div>
                  <div className="col-span-1 row-span-1 bg-white/5 rounded-lg border border-white/5"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="py-10 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Trusted by innovative enterprise teams</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale">
            <span className="text-2xl font-bold font-serif">Acme Corp</span>
            <span className="text-2xl font-bold">GlobalBank</span>
            <span className="text-2xl font-bold tracking-tighter">NexusAI</span>
            <span className="text-2xl font-black italic">Vanguard</span>
            <span className="text-2xl font-semibold">CyberDyne</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to scale AI</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">A complete platform combining powerful automation tools with enterprise-grade security and cost controls.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Bot />}
              title="AI Agents"
              desc="Deploy autonomous agents that reason and execute multi-step workflows automatically."
            />
            <FeatureCard 
              icon={<Shield />}
              title="Security & Governance"
              desc="Detect prompt injections, key leaks, and anomalies in real-time before they reach the provider."
            />
            <FeatureCard 
              icon={<Zap />}
              title="Workflow Automation"
              desc="Connect your internal APIs and databases to LLMs with a visual drag-and-drop builder."
            />
            <FeatureCard 
              icon={<Database />}
              title="RAG Systems"
              desc="Instant vector database provisioning to chat securely with your proprietary documents."
            />
            <FeatureCard 
              icon={<Server />}
              title="Analytics & Logs"
              desc="Track token usage, cost spikes, and latency across all your AI applications in one dashboard."
            />
            <FeatureCard 
              icon={<Settings />}
              title="Custom Integrations"
              desc="Seamlessly integrate with Slack, Microsoft Teams, Salesforce, and your existing tech stack."
            />
          </div>
        </div>
      </section>

      {/* BENEFITS / STATS */}
      <section className="py-32 bg-black/30 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Reduce costs while shipping AI faster</h2>
            <p className="text-slate-400 text-lg mb-8">Stop worrying about rogue agents blowing through your OpenAI budget. TokenShield protects your API keys and sets hard rate limits per-user and per-model.</p>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Save 40% on API Costs</h4>
                  <p className="text-slate-400 text-sm mt-1">Smart semantic caching prevents duplicate prompt charges.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Zero-Day Injection Protection</h4>
                  <p className="text-slate-400 text-sm mt-1">Heuristic and regex-based blocking of malicious prompts.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
             <div className="glass-card p-8 border border-white/10 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-white font-bold">Cost Projection</h4>
                  <span className="text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-bold">-42% vs baseline</span>
                </div>
                <div className="h-48 w-full flex items-end gap-3">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t relative overflow-hidden group">
                      <div className="absolute bottom-0 w-full bg-blue-500/50 transition-all duration-500 group-hover:bg-blue-400" style={{ height: `${80 - (i*4) + Math.random()*20}%` }}></div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, transparent pricing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Start for free, scale when you need enterprise capabilities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              name="Developer" 
              price="Free" 
              desc="Perfect for building and testing AI apps locally."
              features={["10k tokens / month", "Basic rate limiting", "Community support"]}
            />
            <PricingCard 
              name="Pro" 
              price="$49/mo" 
              desc="For production applications with real users."
              features={["10M tokens / month", "Advanced prompt injection blocking", "Cost forecasting", "Email support"]}
              highlight={true}
            />
            <PricingCard 
              name="Enterprise" 
              price="Custom" 
              desc="For large teams with strict compliance needs."
              features={["Unlimited tokens", "Custom integrations", "SOC2 Compliance", "Dedicated Slack channel"]}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FaqItem question="Does TokenShield store my prompts?" answer="No. TokenShield processes prompts in-memory for security evaluation and hashes them for loop detection, but does not store the raw plaintext data in our databases." />
            <FaqItem question="Which LLMs do you support?" answer="We natively support OpenAI and Anthropic through our unified proxy, and can route to local open-source models via Ollama." />
            <FaqItem question="How fast is the proxy?" answer="The security evaluation pipeline is written in highly-optimized asynchronous Python and Rust, adding less than 5ms of latency to standard requests." />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/20"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to secure your AI?</h2>
          <p className="text-blue-100 text-lg mb-10">Join hundreds of enterprise teams shipping AI safely.</p>
          <a href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-white text-blue-900 hover:bg-slate-100 transition shadow-2xl">
            Book a Consultation <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-white/10 transition group">
      <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({ name, price, desc, features, highlight = false }: { name: string, price: string, desc: string, features: string[], highlight?: boolean }) {
  return (
    <div className={`p-8 rounded-2xl border ${highlight ? 'bg-slate-800/80 border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.15)] relative' : 'bg-white/[0.02] border-white/5'}`}>
      {highlight && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-2xl"></div>}
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
      <div className="text-4xl font-black text-white mb-4">{price}</div>
      <p className="text-slate-400 mb-8 h-12">{desc}</p>
      
      <a href="/contact" className={`block w-full py-3 text-center rounded-lg font-bold transition mb-8 ${highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
        Get Started
      </a>
      
      <ul className="space-y-4">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="border border-white/10 rounded-lg bg-slate-900/50 overflow-hidden">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between text-left text-white font-medium hover:bg-white/5 transition"
      >
        {question}
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}
