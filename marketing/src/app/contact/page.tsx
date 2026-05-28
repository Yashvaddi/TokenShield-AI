"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ChevronDown, CheckCircle2, Upload, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Let's secure your AI.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Book a technical consultation with our engineering team or send us a message about your enterprise needs.
          </p>
        </div>
      </section>

      <section className="py-10 mb-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* CONTACT INFO & MAP */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Get in touch</h2>
              <p className="text-slate-400 mb-8">Have questions about TokenShield? We're here to help you build safer AI systems.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-blue-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Email Us</h4>
                    <p className="text-slate-400 text-sm mt-1">security@tokenshield.ai</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-blue-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Headquarters</h4>
                    <p className="text-slate-400 text-sm mt-1">100 AI Innovation Way<br/>San Francisco, CA 94105</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-blue-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Working Hours</h4>
                    <p className="text-slate-400 text-sm mt-1">Mon - Fri: 9:00 AM - 6:00 PM PST<br/>24/7 Enterprise Support Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MAP STUB */}
            <div className="rounded-2xl border border-white/10 bg-white/5 h-64 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
              <p className="text-slate-500 font-medium z-10 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Interactive Map View
              </p>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/10 rounded-3xl blur-[100px] pointer-events-none"></div>
            <div className="glass-card p-8 rounded-3xl border border-white/10 relative z-10 bg-slate-900/80 backdrop-blur-xl">
              {status === 'success' ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400">Our engineering team will reach out to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">First Name</label>
                      <input required name="name" type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" placeholder="Jane" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Company Name</label>
                      <input required name="company" type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" placeholder="Acme Corp" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Work Email</label>
                      <input required name="email" type="email" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" placeholder="jane@acme.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Phone Number</label>
                      <input type="tel" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Service Needed</label>
                    <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition appearance-none">
                      <option value="proxy">TokenShield Proxy Setup</option>
                      <option value="agents">Custom AI Agents</option>
                      <option value="rag">RAG Architecture</option>
                      <option value="audit">Security Audit</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Project Details</label>
                    <textarea required rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition resize-none" placeholder="Tell us about your architecture and security requirements..."></textarea>
                  </div>

                  <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:bg-white/5 transition cursor-pointer">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-300 font-medium">Upload architecture diagram (optional)</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, PNG, or JPEG (Max 10MB)</p>
                  </div>

                  <button 
                    disabled={status === 'submitting'}
                    type="submit" 
                    className="w-full py-4 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === 'submitting' ? 'Sending Request...' : 'Submit Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT FAQ */}
      <section className="py-20 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Support FAQ</h2>
          </div>
          <div className="space-y-4">
            <FaqItem question="Do you offer SLA agreements?" answer="Yes, our Enterprise tier includes a 99.9% uptime SLA with 24/7 dedicated engineering support channels." />
            <FaqItem question="Can I deploy TokenShield on-premise?" answer="TokenShield can be deployed within your own VPC or Kubernetes cluster (AWS, GCP, Azure) to ensure data never leaves your environment." />
            <FaqItem question="How long does implementation take?" answer="Standard cloud deployments take less than 15 minutes. Custom VPC deployments and integrations typically take 1-2 weeks depending on complexity." />
          </div>
        </div>
      </section>
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
