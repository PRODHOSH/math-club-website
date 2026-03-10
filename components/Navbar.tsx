'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isEventsActive = pathname.startsWith('/events');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tutorials', path: '/tutorials' },
    { name: 'Council', path: '/council' },
    { name: 'Team', path: '/team' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-3 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group justify-self-start">
          <img
            src="/math-club-logo.jpeg"
            alt="Mathematics Club Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover transform group-hover:scale-110 transition-transform shadow-lg border-2 border-yellow-500/30"
          />
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-yellow-400 transition-colors">
              Mathematics Club
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest hidden xs:block">VIT Chennai</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-8">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`relative font-medium text-base tracking-wide transition-colors hover:text-yellow-400 ${
                pathname === link.path ? 'text-yellow-500' : 'text-gray-300'
              }`}
            >
              {link.name}
              {pathname === link.path && (
                <motion.div layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
              )}
            </Link>
          ))}

          {/* Events Dropdown */}
          <Link
            href="/events"
            className={`relative font-medium text-base tracking-wide transition-colors hover:text-yellow-400 ${
              isEventsActive ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            Events
            {isEventsActive && (
              <motion.div layoutId="eventsUnderline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
            )}
          </Link>

          {navLinks.slice(2).map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`relative font-medium text-base tracking-wide transition-colors hover:text-yellow-400 ${
                pathname === link.path ? 'text-yellow-500' : 'text-gray-300'
              }`}
            >
              {link.name}
              {pathname === link.path && (
                <motion.div layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
              )}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/recruitment"
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/8 border border-white/15 hover:bg-white/12 hover:border-white/30 text-white font-semibold text-sm transition-all duration-200"
          >
            <ArrowRight size={15} className="text-yellow-400" />
            Join Us
          </Link>
          <button className="lg:hidden text-white z-50" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-1">
              {navLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-base font-medium py-3 px-2 rounded-lg ${
                    pathname === link.path ? 'text-yellow-500' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Events Link */}
              <Link
                href="/events"
                className={`text-base font-medium py-3 px-2 rounded-lg ${
                  isEventsActive ? 'text-yellow-500' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              >
                Events
              </Link>

              {navLinks.slice(2).map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-base font-medium py-3 px-2 rounded-lg ${
                    pathname === link.path ? 'text-yellow-500' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  {link.name}
                </Link>
              ))}

              <Link
                href="/recruitment"
                onClick={() => setIsOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 py-3 rounded-lg bg-white/8 border border-white/15 hover:bg-white/12 hover:border-white/30 text-white font-semibold transition-all duration-200"
              >
                <ArrowRight size={16} className="text-yellow-400" />
                Join Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;