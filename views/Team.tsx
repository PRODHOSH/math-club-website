'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  dept: string;
  contributions: { theme: string; items: string[] }[];
}

const DEPARTMENTS = [
  { id: 'all',        label: 'All',                     color: 'text-white       border-white/20        bg-white/5'          },
  { id: 'WebOps',     label: 'WebOps & Coding',         color: 'text-blue-400    border-blue-500/30     bg-blue-500/10'      },
  { id: 'Multimedia', label: 'Multimedia & Design',     color: 'text-purple-400  border-purple-500/30   bg-purple-500/10'    },
  { id: 'PR',         label: 'PR & Outreach',           color: 'text-green-400   border-green-500/30    bg-green-500/10'     },
  { id: 'Events',     label: 'Events & Coordination',   color: 'text-yellow-400  border-yellow-500/30   bg-yellow-500/10'    },
  { id: 'Content',    label: 'Content & Social Media',  color: 'text-pink-400    border-pink-500/30     bg-pink-500/10'      },
];

const deptAccent: Record<string, string> = {
  WebOps:     'border-l-blue-500    text-blue-400',
  Multimedia: 'border-l-purple-500  text-purple-400',
  PR:         'border-l-green-500   text-green-400',
  Events:     'border-l-yellow-500  text-yellow-400',
  Content:    'border-l-pink-500    text-pink-400',
};

const deptLabel: Record<string, string> = {
  WebOps:     'WebOps & Coding',
  Multimedia: 'Multimedia & Design',
  PR:         'PR & Outreach',
  Events:     'Events & Coordination',
  Content:    'Content & Social Media',
};

const Team: React.FC = () => {
  const [activeDept, setActiveDept] = useState('all');
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('team').select('*').order('id')
      .then(({ data }) => { setTeam((data as TeamMember[]) ?? []); setLoading(false); });
  }, []);

  const displayed = activeDept === 'all' ? team : team.filter(m => m.dept === activeDept);

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium tracking-widest uppercase mb-4">
            Our People
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black mb-3">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Team</span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl">
            {team.length} members across {DEPARTMENTS.length - 1} departments — each one making the club happen.
            Click any card to see their contributions.
          </p>
        </motion.div>

        {/* Department tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {DEPARTMENTS.map(d => {
            const active = activeDept === d.id;
            const [textCls, borderCls, bgCls] = d.color.split(/\s+/);
            return (
              <button
                key={d.id}
                onClick={() => setActiveDept(d.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  active
                    ? `${textCls} ${borderCls} ${bgCls}`
                    : 'text-gray-400 border-white/10 hover:border-white/20 hover:text-gray-200'
                }`}
              >
                {d.label}
                {d.id !== 'all' && (
                  <span className="ml-1.5 opacity-60">{team.filter(m => m.dept === d.id).length}</span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Render */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-white/20 border-t-yellow-400 rounded-full animate-spin" />
          </div>
        ) : activeDept === 'all' ? (
          // Grouped by department
          <div className="flex flex-col gap-12">
            {DEPARTMENTS.slice(1).map(d => (
              <div key={d.id}>
                <div className="flex items-center gap-3 mb-5">
                  <span className={`text-sm font-bold uppercase tracking-widest ${d.color.split(/\s+/)[0]}`}>{d.label}</span>
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-xs text-gray-500">{team.filter(m => m.dept === d.id).length} members</span>
                </div>
                <MemberGrid members={team.filter(m => m.dept === d.id)} onSelect={setSelected} />
              </div>
            ))}
          </div>
        ) : (
          <MemberGrid members={displayed} onSelect={setSelected} />
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className={`relative w-full max-w-md bg-[#0a0a0a] border-l-4 border border-white/10 rounded-2xl overflow-hidden shadow-2xl ${deptAccent[selected.dept]?.split(/\s+/)[0]}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b border-white/8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selected.name}</h2>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${deptAccent[selected.dept]?.split(/\s+/)[1] ?? 'text-gray-400'}`}>
                    {deptLabel[selected.dept]}
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contributions */}
              <div className="p-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
                {selected.contributions.map((section, si) => (
                  <div key={si}>
                    <div className="flex items-center gap-2 mb-3">
                      <Star size={12} className="text-yellow-400 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">{section.theme}</span>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {section.items.map((item, ii) => (
                        <li key={ii} className="flex gap-2.5 text-sm text-gray-300 leading-snug">
                          <span className="w-1 h-1 rounded-full bg-white/30 shrink-0 mt-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MemberGrid: React.FC<{ members: TeamMember[]; onSelect: (m: TeamMember) => void }> = ({ members, onSelect }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
    {members.map((m, idx) => {
      const [, , bgCls] = (DEPARTMENTS.find(d => d.id === m.dept)?.color ?? '').split(/\s+/);
      const accentText = deptAccent[m.dept]?.split(/\s+/)[1] ?? 'text-gray-400';
      return (
        <motion.button
          key={m.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.025, duration: 0.3 }}
          onClick={() => onSelect(m)}
          className={`group text-left border-l-2 ${deptAccent[m.dept]?.split(/\s+/)[0]} bg-white/[0.03] border border-white/8 hover:border-white/15 hover:bg-white/[0.07] rounded-xl px-4 py-3.5 transition-all duration-200 cursor-pointer`}
        >
          {/* Avatar placeholder — initials */}
          <div className={`w-9 h-9 rounded-full ${bgCls || 'bg-white/10'} flex items-center justify-center text-xs font-bold mb-2.5 group-hover:scale-110 transition-transform`}>
            <span className={accentText}>{m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
          </div>
          <p className="text-sm font-semibold text-white leading-snug group-hover:text-yellow-50 transition-colors line-clamp-2">{m.name}</p>
          <p className={`text-[10px] mt-0.5 ${accentText} opacity-70`}>{deptLabel[m.dept]}</p>
        </motion.button>
      );
    })}
  </div>
);

export default Team;
