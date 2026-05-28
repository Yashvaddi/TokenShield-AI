import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TokenShield AI | Enterprise LLM Security",
  description: "Advanced AI API Governance and Cost Protection Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased bg-[#0f172a]`}>
      <body className="min-h-full flex flex-col text-slate-100">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f172a]/80 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                T
              </div>
              <span className="font-bold text-xl tracking-tight">TokenShield AI</span>
            </a>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a href="/" className="hover:text-white transition">Home</a>
              <a href="/services" className="hover:text-white transition">Services</a>
              <a href="/contact" className="hover:text-white transition">Contact</a>
            </nav>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm font-medium hover:text-white transition hidden md:block">Sign In</a>
              <a href="/contact" className="px-5 py-2.5 rounded-full text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition">
                Book a Demo
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="bg-[#0b1120] border-t border-white/5 py-16">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">T</div>
                <span className="font-bold text-lg tracking-tight">TokenShield AI</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">Enterprise-grade LLM governance and security platform. Build AI automations faster.</p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition">𝕏</a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition">in</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="/services" className="hover:text-white transition">Services</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Subscribe</h4>
              <p className="text-slate-400 text-sm mb-4">Get the latest AI security updates.</p>
              <div className="flex">
                <input type="email" placeholder="Email address" className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 text-sm text-white w-full focus:outline-none focus:border-blue-500" />
                <button className="bg-blue-600 px-4 py-2 rounded-r-lg text-sm font-medium text-white hover:bg-blue-500 transition">Join</button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <div>© 2026 TokenShield AI Inc. All rights reserved.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
