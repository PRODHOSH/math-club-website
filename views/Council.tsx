'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Instagram, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CouncilMember {
  id: number;
  name: string;
  role: string;
  photo: string;
  bio: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  sort_order?: number;
}



const Council: React.FC = () => {
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const activeMember = selected !== null ? members.find(m => m.id === selected) : null;

  useEffect(() => {
    supabase
      .from('council')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setMembers(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative z-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium tracking-widest uppercase mb-4">
            Leadership
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black mb-3">
            The <span className="text-yellow-400">Council</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto">
            The nine minds steering Mathematics Club VIT Chennai.
          </p>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-yellow-500/40 border-t-yellow-400 rounded-full animate-spin" />
          </div>
        ) : (
        <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 max-w-5xl mx-auto pb-20" style={{ isolation: 'isolate' }}>
          {members.map((member, idx) => {
            const offsets = [
              { r: -7,  x: 16,  y: 0  },
              { r: 10,  x: -14, y: 52 },
              { r: -4,  x: 10,  y: 18 },
              { r: 13,  x: -20, y: 68 },
              { r: -9,  x: 22,  y: 26 },
              { r:  6,  x: -10, y: 44 },
              { r: -5,  x: 12,  y: 8  },
              { r: 10,  x: -8,  y: 60 },
              { r:-12,  x: 26,  y: 34 },
            ];
            const zOrders = [4, 2, 3, 1, 4, 3, 2, 4, 1];
            const off = offsets[idx % offsets.length];
            return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, rotate: 0, x: 0, y: 0, scale: 0.8 }}
              animate={{
                opacity: 1, rotate: off.r, x: off.x, y: off.y, scale: 1,
                transition: { delay: idx * 0.09, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              }}
              whileHover={{
                rotate: 0, x: 0, y: 0, scale: 1.12,
                transition: { type: 'spring', stiffness: 280, damping: 22 }
              }}
              onClick={() => setSelected(member.id as number)}
              className="group relative cursor-pointer rounded-2xl overflow-hidden border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_2px_8px_rgba(0,0,0,0.6)]"
              style={{ zIndex: zOrders[idx % zOrders.length] }}
            >
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden bg-white/5">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Name / role */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="w-6 h-[2px] bg-yellow-400 mb-2 group-hover:w-3/4 transition-all duration-500 ease-out" />
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight drop-shadow-lg">{member.name}</h3>
                <p className="text-[10px] sm:text-xs text-yellow-200/60 uppercase tracking-widest mt-0.5">{member.role}</p>
              </div>

              {/* Corner string-light accent */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-yellow-400/30 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-yellow-400/30 rounded-tr-2xl" />

              {/* Social icons */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300">
                {member.linkedin && member.linkedin !== '#' && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="p-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white hover:text-yellow-400 transition-colors">
                    <Linkedin size={13} />
                  </a>
                )}
                {member.github && (
                  <a href={member.github} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="p-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white hover:text-yellow-400 transition-colors">
                    <Github size={13} />
                  </a>
                )}
                {member.instagram && (
                  <a href={member.instagram} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="p-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white hover:text-yellow-400 transition-colors">
                    <Instagram size={13} />
                  </a>
                )}
              </div>
            </motion.div>
            );
          })}
        </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeMember && (
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
              className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={activeMember.photo} alt={activeMember.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/30 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 backdrop-blur-sm text-gray-300 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-7 pb-7 -mt-2">
                <h2 className="text-2xl font-bold text-white mb-1">{activeMember.name}</h2>
                <p className="text-yellow-400 text-sm font-semibold mb-4">{activeMember.role}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{activeMember.bio}</p>

                <div className="flex gap-2">
                  {activeMember.linkedin && activeMember.linkedin !== '#' && (
                    <a href={activeMember.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/8 hover:bg-[#0077b5]/20 hover:border-[#0077b5]/40 text-sm font-semibold text-gray-300 hover:text-white transition-all">
                      <Linkedin size={15} /> LinkedIn
                    </a>
                  )}
                  {activeMember.github && (
                    <a href={activeMember.github} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 text-sm font-semibold text-gray-300 hover:text-white transition-all">
                      <Github size={15} /> GitHub
                    </a>
                  )}
                  {activeMember.instagram && (
                    <a href={activeMember.instagram} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/8 hover:bg-purple-500/20 hover:border-purple-500/30 text-sm font-semibold text-gray-300 hover:text-white transition-all">
                      <Instagram size={15} /> Instagram
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Council;