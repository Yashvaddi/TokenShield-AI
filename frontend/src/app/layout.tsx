import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ClientWrapper } from "@/components/layout/ClientWrapper";
import { ReduxProvider } from "@/store/Provider";

import { AuthProvider } from "@/components/layout/AuthProvider";

export const metadata: Metadata = {
  title: "TokenShield AI | Dashboard",
  description: "Enterprise LLM Security and Governance Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex text-slate-100 bg-[#0f172a]">
        <AuthProvider>
          <ReduxProvider>
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
