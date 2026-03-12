'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, ExternalLink, FileText, FileCheck, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const courseIconColor: Record<string, string> = {
  "Discrete Mathematics and Graph Theory": 'text-blue-300',
  "Vector Calculus for 1st years":         'text-emerald-300',
  "Probability and Statistics":            'text-purple-300',
  "Complex Variables and Linear Algebra":  'text-orange-300',
};

interface Tutorial {
  id: number; name: string; course: string; module: number;
  questionsLink: string; solutionsLink: string;
}

const Tutorials: React.FC = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeCourse, setActiveCourse] = useState<string>('');
  const [search, setSearch]             = useState('');

  useEffect(() => {
    supabase.from('tutorials').select('*').order('course').then(({ data }) => {
      const mapped: Tutorial[] = (data ?? []).map((r: any) => ({
        id: r.id, name: r.name, course: r.course, module: r.module,
        questionsLink: r.questions_link ?? '#', solutionsLink: r.solutions_link ?? '#',
      }));
      setTutorials(mapped);
      if (mapped.length > 0) setActiveCourse(mapped[0].course);
      setLoading(false);
    });
  }, []);

  const courses = useMemo(() => Array.from(new Set(tutorials.map(t => t.course))), [tutorials]);
  const filtered = useMemo(() => tutorials.filter(t => {
    const q = search.toLowerCase();
    return t.course === activeCourse && t.name.toLowerCase().includes(q);
  }), [tutorials, activeCourse, search]);

  const iconColor = courseIconColor[activeCourse] ?? 'text-yellow-300';

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-8 h-8 border-2 border-yellow-500/40 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen relative z-10">

      {/* ── Hero ── */}
      <div className="pt-28 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/8 border border-white/12 text-white/60 text-xs font-semibold tracking-widest uppercase mb-5">
              <BookOpen size={12} /> Study Resources
            </div>
            <h1 className="text-6xl sm:text-7xl font-heading font-black leading-tight">
              <span className="text-yellow-400">Tutorial</span> <span className="text-white">Sheets</span>
            </h1>
            <p className="text-white/40 text-base mt-3">Module-wise question banks &amp; solutions across all courses.</p>
          </motion.div>
        </div>
      </div>

      {/* ── Main blurred card ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden"
        >
          {/* Search bar */}
          <div className="px-8 pt-7 pb-5 border-b border-white/[0.06]">
            <div className="relative">
              <Search size={17} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder={`Search in ${activeCourse || 'sheets'}…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-13 pr-10 py-4 bg-white/[0.05] border border-white/8 rounded-2xl text-base text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/40 transition-all"
                style={{ paddingLeft: '3.25rem' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex">

            {/* ── Left sidebar: courses ── */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-white/[0.06] p-5 gap-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-3 mb-2">Courses</p>
              {courses.map(c => {
                const isActive = activeCourse === c;
                const count = tutorials.filter(t => t.course === c).length;
                return (
                  <button
                    key={c}
                    onClick={() => { setActiveCourse(c); setSearch(''); }}
                    className={`flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl text-sm font-medium text-left transition-all ${
                      isActive
                        ? 'bg-yellow-500/15 text-yellow-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{c}</span>
                    <span className={`shrink-0 text-xs ${isActive ? 'text-yellow-500/60' : 'text-gray-700'}`}>{count}</span>
                  </button>
                );
              })}
            </aside>

            {/* ── Sheet list ── */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
                <h2 className="text-base font-bold text-white">{activeCourse}</h2>
                <p className="text-sm text-gray-500">{filtered.length} sheet{filtered.length !== 1 ? 's' : ''}</p>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-24">
                  <FileText size={36} className="mx-auto mb-4 text-gray-700" />
                  <p className="text-base text-gray-500">No sheets found.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {filtered.map((t, idx) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.22 }}
                      className="flex items-center justify-between gap-4 px-8 py-6 hover:bg-white/[0.03] transition-colors group border-b border-white/[0.05] last:border-0"
                    >
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/[0.06]">
                          <FileText size={22} className={iconColor} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xl font-bold text-white group-hover:text-yellow-50 transition-colors">{t.name}</p>
                          <p className="text-sm text-gray-500 mt-1">Module {t.module}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <a href={t.questionsLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/20 transition-colors">
                          <FileText size={15} /> Questions <ExternalLink size={11} className="opacity-40" />
                        </a>
                        <a href={t.solutionsLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/8 text-gray-300 text-sm font-semibold hover:bg-white/10 hover:text-white transition-colors">
                          <FileCheck size={15} /> Solutions <ExternalLink size={11} className="opacity-40" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Tutorials;
