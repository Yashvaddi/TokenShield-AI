import { Bot, Workflow, Database, Code2, LineChart, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* SERVICES HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Enterprise AI Solutions
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10">
            From secure LLM proxies to autonomous AI agents, we build and deploy highly secure, cost-optimized AI infrastructure tailored for enterprise workflows.
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard 
              icon={<Bot />}
              title="AI Chatbot Development"
              desc="Custom conversational interfaces connected to your private data, deployed with enterprise-grade RBAC and compliance controls."
            />
            <ServiceCard 
              icon={<Workflow />}
              title="Autonomous AI Agents"
              desc="Multi-step reasoning agents that interact with APIs, databases, and third-party SaaS to automate complex operational workflows."
            />
            <ServiceCard 
              icon={<Database />}
              title="RAG Systems (Retrieval)"
              desc="Vector database architecture securely indexing your proprietary documents without leaking data to public LLM providers."
            />
            <ServiceCard 
              icon={<ShieldCheck />}
              title="AI Security & Proxy"
              desc="Our flagship TokenShield API gateway deployment to protect against prompt injections, LLM attacks, and budget overruns."
            />
            <ServiceCard 
              icon={<Code2 />}
              title="Custom AI Integrations"
              desc="Connecting OpenAI, Anthropic, or local open-source models (Llama 3, Mistral) directly into your existing software stack."
            />
            <ServiceCard 
              icon={<LineChart />}
              title="AI Analytics & Forecasting"
              desc="ClickHouse-powered ML models predicting token usage and infrastructure costs across your organization."
            />
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="py-32 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16">How We Build</h2>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <ProcessStep num="01" title="Discovery" desc="Architecture and security mapping" />
              <ProcessStep num="02" title="Planning" desc="Threat modeling and LLM routing" />
              <ProcessStep num="03" title="Development" desc="Agile CI/CD integrations" />
              <ProcessStep num="04" title="Deployment" desc="Kubernetes cloud rollout" />
              <ProcessStep num="05" title="Support" desc="24/7 Monitoring & alerting" />
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-20 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Built with Modern Technologies</p>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <TechBadge name="OpenAI / Anthropic" />
            <TechBadge name="LangChain" />
            <TechBadge name="Next.js 14" />
            <TechBadge name="Python / FastAPI" />
            <TechBadge name="AWS / Kubernetes" />
            <TechBadge name="PostgreSQL / ClickHouse" />
            <TechBadge name="Pinecone / Qdrant" />
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="py-32 bg-black/40 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Proven Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-24 h-24 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">GlobalBank</h3>
              <p className="text-blue-400 font-medium mb-6">Threat Mitigation Implementation</p>
              <div className="flex items-end gap-6 mb-6">
                <div>
                  <div className="text-3xl font-black text-emerald-400 mb-1">99.9%</div>
                  <div className="text-xs text-slate-400 uppercase">Injections Blocked</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white mb-1">10ms</div>
                  <div className="text-xs text-slate-400 uppercase">Proxy Latency</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm">Deployed TokenShield proxy to secure internal HR chatbots against prompt jailbreaks.</p>
            </div>
            
            <div className="glass-card p-8 border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <LineChart className="w-24 h-24 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">NexusAI</h3>
              <p className="text-emerald-400 font-medium mb-6">Cost Optimization Infrastructure</p>
              <div className="flex items-end gap-6 mb-6">
                <div>
                  <div className="text-3xl font-black text-emerald-400 mb-1">42%</div>
                  <div className="text-xs text-slate-400 uppercase">Cost Reduction</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white mb-1">2.4M</div>
                  <div className="text-xs text-slate-400 uppercase">Tokens Saved/Day</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm">Implemented semantic caching and EWMA-based rate limiting to prevent budget explosion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to secure your workflows?</h2>
          <p className="text-slate-400 text-lg mb-10">Schedule a technical consultation with our AI engineering team.</p>
          <a href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-[0_0_30px_rgba(37,99,235,0.4)]">
            Book a Technical Review <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition">
      <div className="w-12 h-12 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function ProcessStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-[#0f172a] border-4 border-blue-500 flex items-center justify-center text-white font-bold mb-4 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
        {num}
      </div>
      <h4 className="text-white font-bold mb-2">{title}</h4>
      <p className="text-slate-400 text-xs text-center">{desc}</p>
    </div>
  );
}

function TechBadge({ name }: { name: string }) {
  return (
    <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-300 text-sm font-medium hover:bg-white/10 transition cursor-default">
      {name}
    </div>
  );
}
