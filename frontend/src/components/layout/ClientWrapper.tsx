"use client";

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/login';

  if (isAuthRoute) {
    return (
      <div className="flex-1 min-h-screen relative overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen relative overflow-x-hidden">
        {children}
      </div>
    </>
  );
}
