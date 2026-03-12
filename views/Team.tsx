'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Users, Star, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  dept: string;
  reg_no?: string;
  points?: number;
  avatar_url?: string;
  contributions: { description: string; points: number }[];
}

const DEPTS = [
  { id: 'all',         label: 'All',                  color: 'text-white',       bg: 'bg-white/10',          border: 'border-white/20' },
  { id: 'Social',      label: 'Social Media & Design', color: 'text-pink-400',    bg: 'bg-pink-500/10',       border: 'border-pink-500/30' },
  { id: 'Content',     label: 'Content & Outreach',    color: 'text-purple-400',  bg: 'bg-purple-500/10',     border: 'border-purple-500/30' },
  { id: 'Events',      label: 'Event Management',      color: 'text-orange-400',  bg: 'bg-orange-500/10',     border: 'border-orange-500/30' },
  { id: 'Marketing',   label: 'Marketing',             color: 'text-green-400',   bg: 'bg-green-500/10',      border: 'border-green-500/30' },
  { id: 'Research',    label: 'Research',              color: 'text-yellow-400',  bg: 'bg-yellow-500/10',     border: 'border-yellow-500/30' },
];

const deptColor: Record<string, string> = {
  Social:    'text-pink-400',
  Content:   'text-purple-400',
  Events:    'text-orange-400',
  Marketing: 'text-green-400',
  Research:  'text-yellow-400',
};

const deptBg: Record<string, string> = {
  Social:    'bg-pink-500/20',
  Content:   'bg-purple-500/20',
  Events:    'bg-orange-500/20',
  Marketing: 'bg-green-500/20',
  Research:  'bg-yellow-500/20',
};

const deptLabel: Record<string, string> = {
  Social:    'Social Media & Design',
  Content:   'Content & Outreach',
  Events:    'Event Management',
  Marketing: 'Marketing',
  Research:  'Research',
};

function Avatar({ name, url }: { name: string; url?: string }) {
  const [err, setErr] = useState(false);
  if (url && !err) {
    return (
      <img src={url} onError={() => setErr(true)}
        className="w-20 h-20 rounded-full object-cover mx-auto mb-3 ring-2 ring-white/10" alt="" />
    );
  }
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-orange-600', 'bg-green-700', 'bg-yellow-600', 'bg-teal-600'];
  const bg = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div className={`w-20 h-20 rounded-full ${bg} flex items-center justify-center mx-auto mb-3 ring-2 ring-white/10 text-white text-xl font-bold`}>
      {initials}
    </div>
  );
}

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeDept, setActiveDept] = useState('all');
  const [selected, setSelected] = useState<TeamMember | null>(null);

  useEffect(() => {
    supabase.from('team').select('*').order('name')
      .then(({ data }) => { setTeam((data as TeamMember[]) ?? []); setLoading(false); });
  }, []);

  const displayed = team.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name?.toLowerCase().includes(q) || m.reg_no?.toLowerCase().includes(q);
    const matchDept = activeDept === 'all' || m.dept === activeDept;
    return matchSearch && matchDept;
  });

  return (
    <div className="min-h-screen relative z-10 pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-4">
            <Users size={12} /> Our People
          </div>
          <h1 className="text-5xl sm:text-6xl font-heading font-black mb-3">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Team</span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl">
            {team.length} members across {DEPTS.length - 1} departments — each one making the club happen.
          </p>
        </motion.div>

        {/* Search + Dept Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              suppressHydrationWarning
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or reg no…"
              className="w-full pl-11 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/40 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {DEPTS.map(d => (
              <button
                suppressHydrationWarning
                key={d.id}
                onClick={() => setActiveDept(d.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  activeDept === d.id ? `${d.color} ${d.bg} ${d.border}` : 'text-gray-400 border-white/10 hover:border-white/20 hover:text-gray-200'
                }`}
              >
                {d.label}
                {d.id !== 'all' && (
                  <span className="ml-1.5 opacity-50">{team.filter(m => m.dept === d.id).length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-28">
            <div className="w-8 h-8 border-2 border-white/20 border-t-yellow-400 rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-28">
            <Users size={40} className="mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500 text-base">No team members found.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            <AnimatePresence>
              {displayed.map((m, i) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.2, delay: i * 0.015 }}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-center hover:border-white/20 hover:bg-white/[0.07] transition-all cursor-pointer group"
                  onClick={() => setSelected(m)}
                >
                  <Avatar name={m.name} url={m.avatar_url} />
                  <p className="text-white font-bold text-sm leading-tight uppercase tracking-wide mb-1 group-hover:text-yellow-50 transition-colors line-clamp-2">{m.name}</p>
                  {m.reg_no && <p className="text-gray-500 text-xs mb-2">{m.reg_no}</p>}
                  {m.dept && (
                    <p className={`text-[10px] font-semibold uppercase tracking-wider mb-3 ${deptColor[m.dept] ?? 'text-gray-400'}`}>
                      {deptLabel[m.dept] ?? m.dept}
                    </p>
                  )}
                  {typeof m.points === 'number' && (
                    <p className="text-yellow-400 text-sm font-bold mb-3">{m.points} pts</p>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); setSelected(m); }}
                    className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    Contributions
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Contributions Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.name} url={selected.avatar_url} />
                  <div>
                    <p className="text-white font-bold text-lg leading-tight uppercase">{selected.name}</p>
                    {selected.reg_no && <p className="text-gray-500 text-xs mt-0.5">{selected.reg_no}</p>}
                    {selected.dept && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${deptColor[selected.dept] ?? 'text-gray-400'}`}>
                        {deptLabel[selected.dept] ?? selected.dept}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0">
                  <X size={14} />
                </button>
              </div>

              {typeof selected.points === 'number' && (
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5 mb-5">
                  <Star size={14} className="text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-bold">{selected.points} points</span>
                </div>
              )}

              {selected.contributions && selected.contributions.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selected.contributions.map((c, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 bg-white/[0.04] rounded-xl px-4 py-3">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                        <span className="text-sm text-gray-300">{c.description}</span>
                      </div>
                      {c.points > 0 && (
                        <span className="text-yellow-400 text-xs font-bold whitespace-nowrap">+{c.points} pts</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No contributions listed yet.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}