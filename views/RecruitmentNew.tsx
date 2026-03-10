'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, ChevronDown, AlertCircle, Loader2,
  Palette, Code2, Megaphone, Calendar, TrendingUp, BookOpen, ArrowRight, Lock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

const RECRUITMENT_DEADLINE = new Date('2026-03-31T23:59:59');

const DEPARTMENTS = [
  { id: 'design',    title: 'Social Media & Design', icon: Palette,    bg: '#AD1457', description: 'Crafting the visual identity of the club across all platforms.' },
  { id: 'technical', title: 'Technical',              icon: Code2,      bg: '#1565C0', description: 'Building tools, websites, and solutions that power the club.' },
  { id: 'content',   title: 'Content & Outreach',     icon: Megaphone,  bg: '#6A1B9A', description: 'Creating compelling content and expanding our community reach.' },
  { id: 'events',    title: 'Event Management',        icon: Calendar,   bg: '#BF360C', description: 'Planning and executing workshops, competitions, and gatherings.' },
  { id: 'marketing', title: 'Marketing',               icon: TrendingUp, bg: '#00695C', description: 'Promoting events, driving engagement, and growing the brand.' },
  { id: 'research',  title: 'Research',                icon: BookOpen,   bg: '#E65100', description: 'Diving deep into mathematics and publishing insightful work.' },
];

function useCountdown(deadline: Date) {
  const calc = () => {
    const diff = Math.max(0, deadline.getTime() - Date.now());
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function DeptCard({ dept, index }: { dept: typeof DEPARTMENTS[0]; index: number }) {
  const Icon = dept.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 * index, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="relative rounded-3xl overflow-hidden cursor-pointer group h-72"
      style={{ background: dept.bg }}
    >
      <div className="absolute -right-8 -bottom-8 opacity-[0.12] group-hover:opacity-20 group-hover:scale-105 transition-all duration-500 pointer-events-none">
        <Icon size={200} color="white" strokeWidth={0.9} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 pointer-events-none" />
      <div className="relative p-7 flex flex-col h-full">
        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-auto">
          <Icon size={20} color="white" />
        </div>
        <div>
          <h3 className="text-[1.4rem] font-bold text-white leading-snug tracking-tight">{dept.title}</h3>
          <p className="text-sm text-white/65 mt-2 leading-relaxed">{dept.description}</p>
          <div className="flex items-center gap-1.5 mt-5 text-white/40 text-xs font-semibold uppercase tracking-wider group-hover:text-white/80 transition-colors duration-200">
            <span>Apply</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HeroCountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/[0.06] border border-white/[0.09] rounded-2xl px-5 py-4 min-w-[76px] backdrop-blur-sm">
      <span className="text-3xl font-bold text-white tabular-nums leading-none tracking-tight">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-white/35 uppercase tracking-[0.12em] mt-1.5">{label}</span>
    </div>
  );
}

function NavCountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[28px]">
      <span className="text-sm font-bold text-white/80 tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[8px] text-white/30 uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

function RecruitmentHeader({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const { days, hours, minutes, seconds } = useCountdown(RECRUITMENT_DEADLINE);
  return (
    <header className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/math-club-logo.jpeg" alt="Math Club" className="w-7 h-7 rounded-lg object-cover" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-semibold text-white/80">Mathematics Club</span>
            <span className="text-white/20">/</span>
            <span className="text-sm text-white/35">Recruitment</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NavCountUnit value={days}    label="d" />
          <span className="text-white/15 text-xs pb-3">:</span>
          <NavCountUnit value={hours}   label="h" />
          <span className="text-white/15 text-xs pb-3">:</span>
          <NavCountUnit value={minutes} label="m" />
          <span className="text-white/15 text-xs pb-3">:</span>
          <NavCountUnit value={seconds} label="s" />
        </div>
        <ProfileMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}

function ProfileMenu({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const name   = user.user_metadata?.full_name as string | undefined;
  const email  = user.email ?? '';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-white/8 transition-colors"
      >
        {avatar ? (
          <img src={avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-xs">
            {email[0]?.toUpperCase()}
          </div>
        )}
        <ChevronDown size={13} className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 mt-2 w-64 bg-[#141414] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-sm shrink-0">
                  {email[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                {name && <p className="text-sm font-semibold text-white truncate">{name}</p>}
                <p className="text-xs text-white/40 truncate">{email}</p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SignInModal({ onSignIn, loading, invalidEmail }: {
  onSignIn: () => void;
  loading: boolean;
  invalidEmail: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-[#080808] flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm text-center"
      >
        <div className="flex justify-center mb-5">
          <img src="/math-club-logo.jpeg" alt="Math Club" className="w-14 h-14 rounded-2xl object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Mathematics Club</h1>
        <p className="text-white/35 text-sm mt-1 mb-8">VIT Chennai - Recruitment Portal</p>
        <p className="text-white/50 text-sm leading-relaxed mb-6 px-3">
          Sign in with your official <strong className="text-white/70">@vitstudent.ac.in</strong> email to continue.
        </p>
        {invalidEmail && (
          <div className="mb-5 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 text-left">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>Only <strong>@vitstudent.ac.in</strong> addresses are accepted. Please switch accounts and try again.</span>
          </div>
        )}
        <button
          onClick={onSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 disabled:opacity-50 text-black font-semibold rounded-xl py-3.5 transition-colors mb-3 text-sm"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <GoogleIcon />}
          {loading ? 'Redirecting...' : 'Continue with Google'}
        </button>
        <a
          href="/"
          className="w-full flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-white/60 hover:text-white font-medium rounded-xl py-3.5 transition-colors text-sm"
        >
          Back to Home
        </a>
        <p className="text-white/15 text-xs mt-6 leading-relaxed">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </motion.div>
    </div>
  );
}

export default function Recruitment() {
  const [user, setUser]                       = useState<User | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [signingIn, setSigningIn]             = useState(false);
  const [invalidEmail, setInvalidEmail]       = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [recruitmentOpen, setRecruitmentOpen] = useState<boolean | null>(null);
  const { days, hours, minutes, seconds }     = useCountdown(RECRUITMENT_DEADLINE);

  const validateAndSet = async (u: User) => {
    if (!u.email?.endsWith('@vitstudent.ac.in')) {
      await supabase.auth.signOut();
      setInvalidEmail(true);
      setUser(null);
      setLoading(false);
      setShowModal(true);
      return;
    }
    setInvalidEmail(false);
    setUser(u);
    setShowModal(false);
    const { data } = await supabase.from('settings').select('value').eq('key', 'recruitment_open').single();
    setRecruitmentOpen(data?.value === 'true');
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) validateAndSet(session.user);
      else { setLoading(false); setShowModal(true); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) validateAndSet(session.user);
      else { setUser(null); setLoading(false); setShowModal(true); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      <AnimatePresence>
        {showModal && (
          <SignInModal onSignIn={handleSignIn} loading={signingIn} invalidEmail={invalidEmail} />
        )}
      </AnimatePresence>

      {user && (
        <>
          <RecruitmentHeader user={user} onSignOut={handleSignOut} />

          {/* Fetching setting */}
          {recruitmentOpen === null && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
          )}

          {/* Recruitment closed */}
          {recruitmentOpen === false && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-6">
                <Lock size={26} className="text-white/25" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Recruitment Closed</h2>
              <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                Applications are not open right now. We will let you know soon!
              </p>
            </motion.div>
          )}

          {/* Recruitment open */}
          {recruitmentOpen === true && (
            <>
              <section className="relative pt-20 pb-16 px-6 text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-yellow-500/[0.04] blur-[100px] rounded-full" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="relative max-w-2xl mx-auto"
                >
                  <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.09] rounded-full px-4 py-1.5 text-xs text-white/45 mb-7">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                    Applications open - 2025-26
                  </div>
                  <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-4">
                    Join Mathematics<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400">
                      Club VIT Chennai
                    </span>
                  </h1>
                  <p className="text-white/35 text-lg leading-relaxed mb-10 max-w-md mx-auto">
                    Be part of a community that loves numbers, ideas, and making things happen.
                  </p>
                  <div className="flex items-center justify-center flex-wrap gap-3">
                    <span className="text-white/25 text-sm w-full sm:w-auto">Applications close in</span>
                    <div className="flex items-center gap-3">
                      <HeroCountBox value={days}    label="Days" />
                      <HeroCountBox value={hours}   label="Hours" />
                      <HeroCountBox value={minutes} label="Minutes" />
                      <HeroCountBox value={seconds} label="Seconds" />
                    </div>
                  </div>
                </motion.div>
              </section>

              <main className="max-w-7xl mx-auto px-6 pb-24 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-2xl font-bold text-white tracking-tight">Choose Your Department</h2>
                  <p className="text-white/30 mt-2 text-sm">Pick what excites you - you can apply to multiple teams</p>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DEPARTMENTS.map((dept, i) => (
                    <DeptCard key={dept.id} dept={dept} index={i} />
                  ))}
                </div>
              </main>
            </>
          )}
        </>
      )}
    </div>
  );
}