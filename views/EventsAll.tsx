'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ExternalLink, X, Users, Youtube, MapPin, Phone, UserPlus, Zap, Clock, Archive } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';


interface EventItem {
  id: number;
  title: string;
  date: string;
  image: string;
  description: string;
  status: 'upcoming' | 'current' | 'past';
  outcome?: string;
  activities?: string;
  registrations?: number;
  youtube_link?: string;
  highlights?: string;
}

const EventModal: React.FC<{ event: EventItem; onClose: () => void }> = ({ event, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
  >
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-4xl bg-black border border-white/10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
    >
      <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white/40 hover:text-white transition-colors">
        <X size={20} />
      </button>
      <div className="w-full md:w-2/5 bg-[#0a0a0a] flex items-center justify-center border-r border-white/10 min-h-[220px]">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-contain max-h-[340px] md:max-h-[560px]" />
        ) : (
          <div className="w-full h-full min-h-[220px] bg-white/5 flex items-center justify-center text-white/20 text-4xl">∑</div>
        )}
      </div>
      <div className="w-full md:w-3/5 p-8 overflow-y-auto flex flex-col gap-5">
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <Calendar size={12} /><span>{event.date}</span>
          {event.registrations != null && event.registrations > 0 && (
            <><span className="text-white/20">·</span><Users size={12} /><span>{event.registrations} registrations</span></>
          )}
        </div>
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-white leading-tight">{event.title}</h2>
        <p className="text-white/60 text-sm leading-relaxed">{event.description}</p>
        {event.outcome && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-[10px] uppercase tracking-[3px] text-white/25 mb-2">Details</p>
            <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{event.outcome}</p>
          </div>
        )}
        {event.activities && (
          <div className="border-t border-white/10 pt-4 flex items-start gap-2">
            <MapPin size={13} className="text-white/40 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-white/25 mb-1">Venue</p>
              <p className="text-white/50 text-sm">{event.activities}</p>
            </div>
          </div>
        )}
        {event.highlights && (
          <div className="border-t border-white/10 pt-4 flex items-start gap-2">
            <Phone size={13} className="text-white/40 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-white/25 mb-1">Coordinator</p>
              <p className="text-white/50 text-sm">{event.highlights}</p>
            </div>
          </div>
        )}
        {event.youtube_link && (
          <a href={event.youtube_link} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest uppercase py-3.5 hover:bg-red-600/30 transition-colors">
            <Youtube size={14} /> Watch on YouTube
          </a>
        )}

        {/* Register / Event Over button */}
        <div className="mt-auto pt-2">
          {event.status === 'past' ? (
            <div className="flex items-center justify-center w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/30 text-sm font-semibold cursor-not-allowed">
              Event Over
            </div>
          ) : (
            <Link
              href={`/events/${event.id}/register`}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors"
            >
              <UserPlus size={15} /> Register Now
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const EventCard: React.FC<{ event: EventItem; onClick: () => void; big?: boolean; idx: number }> = ({ event, onClick, big, idx }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.05 }}
    onClick={onClick}
    className={`group relative cursor-pointer bg-[#111111] border border-white/[0.08] rounded-xl overflow-hidden hover:border-white/20 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40 transition-all duration-300 flex flex-col ${big ? 'flex-row md:flex-row' : ''}`}
  >
    <div className={`overflow-hidden bg-white/5 shrink-0 ${big ? 'w-full md:w-1/2 h-56 md:h-auto' : 'h-52 w-full'}`}>
      {event.image ? (
        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/10 text-6xl">∑</div>
      )}
    </div>
    <div className={`px-5 pt-4 pb-5 flex flex-col flex-1 ${big ? 'justify-center' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
          event.status === 'current'
            ? 'border-green-500/40 text-green-400 bg-green-500/10'
            : 'border-blue-500/40 text-blue-400 bg-blue-500/10'
        }`}>{event.status === 'current' ? '● Live' : 'Upcoming'}</span>
        <span className="text-[11px] text-white/35">{event.date}</span>
      </div>
      <h2 className={`font-heading font-bold text-white mb-2 leading-snug group-hover:text-yellow-300 transition-colors ${big ? 'text-xl md:text-2xl' : 'text-lg'}`}>
        {event.title}
      </h2>
      <p className="text-white/45 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">{event.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs text-white/30">
        <span>Click to view details</span>
        {event.registrations != null && event.registrations > 0 && (
          <span className="flex items-center gap-1"><Users size={11} /> {event.registrations}</span>
        )}
      </div>
      <Link
        href={`/events/${event.id}/register`}
        onClick={(e) => e.stopPropagation()}
        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-semibold rounded-lg hover:bg-green-600/30 transition-colors"
      >
        <UserPlus size={13} /> Register
      </Link>
    </div>
  </motion.div>
);

const EventsAll: React.FC = () => {
  const [current, setCurrent]   = useState<EventItem[]>([]);
  const [upcoming, setUpcoming] = useState<EventItem[]>([]);
  const [past, setPast]         = useState<EventItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<EventItem | null>(null);

  useEffect(() => {
    const load = async () => {
      // Auto-promote upcoming → current
      await supabase
        .from('events')
        .update({ status: 'current' })
        .eq('status', 'upcoming')
        .lte('event_datetime', new Date().toISOString())
        .not('event_datetime', 'is', null);

      const { data } = await supabase.from('events').select('*').order('id', { ascending: false });
      const all = (data ?? []) as EventItem[];
      setCurrent(all.filter(e => e.status === 'current'));
      setUpcoming(all.filter(e => e.status === 'upcoming'));
      setPast(all.filter(e => e.status === 'past'));
      setLoading(false);
    };
    load();
  }, []);

  const featured = [...current, ...upcoming];

  return (
    <>
      {selected && <style>{`nav { display: none !important; }`}</style>}

      <div className="min-h-screen text-white pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[11px] font-semibold tracking-widest uppercase mb-4">
              <Calendar size={11} /> Events
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold font-heading mb-3">
              What's <span className="text-yellow-400">Happening</span>
            </h1>
            <p className="text-white/50 text-base max-w-lg">Current and upcoming events from Mathematics Club VIT Chennai.</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-yellow-500/40 border-t-yellow-400 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ── Current + Upcoming ── */}
              <>
                  {/* Live events row */}
                  {current.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap size={15} className="text-green-400" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-green-400">Live Now</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {current.map((event, idx) => (
                          <EventCard key={event.id} event={event} idx={idx} big={current.length === 1} onClick={() => setSelected(event)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming events row */}
                  {upcoming.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock size={15} className="text-blue-400" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-300">Upcoming</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {upcoming.map((event, idx) => (
                          <EventCard key={event.id} event={event} idx={idx} onClick={() => setSelected(event)} />
                        ))}
                      </div>
                    </div>
                  )}
                </>

              {/* ── Past Events ── */}
              {past.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Archive size={15} className="text-white/40" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Past Events</h2>
                    <span className="text-[11px] text-white/25 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{past.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
                    {past.map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => setSelected(event)}
                        className="group cursor-pointer bg-[#111111] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/15 hover:scale-[1.02] transition-all duration-300 flex flex-col"
                      >
                        <div className="h-108 overflow-hidden bg-white/5">
                          {event.image ? (
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10 text-5xl">∑</div>
                          )}
                        </div>
                        <div className="px-5 py-4 flex flex-col gap-1.5">
                          <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">{event.date}</span>
                          <h3 className="text-base font-bold text-white/80 group-hover:text-white transition-colors leading-snug">{event.title}</h3>
                          <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{event.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
};

export default EventsAll;
