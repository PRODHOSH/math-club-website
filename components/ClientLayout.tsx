'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

const ThreeBackground = dynamic(() => import('./ThreeBackground'), { ssr: false });

interface ClientLayoutProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0 },
} as const;

const pageTransition = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] };

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/coordinator') || pathname?.startsWith('/recruitment')) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-yellow-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ThreeBackground />
      </div>
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          className="relative z-10"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
