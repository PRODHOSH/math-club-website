'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

// Dynamically import ThreeBackground to avoid SSR issues
const ThreeBackground = dynamic(() => import('./ThreeBackground'), { ssr: false });

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Don't render public layout for admin/core/recruitment pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/core') || pathname?.startsWith('/recruitment')) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-yellow-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ThreeBackground />
      </div>
      <Navbar />
      <main className="relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
