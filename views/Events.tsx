'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ExternalLink, X, Users, Youtube, Star, UserPlus } from 'lucide-react';
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
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white/40 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>

      {/* Image */}
      <div className="w-full md:w-2/5 bg-[#0a0a0a] flex items-center justify-center border-r border-white/10 min-h-[220px]">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-contain max-h-[340px] md:max-h-[560px]"
          />
        ) : (
          <div className="w-full h-full min-h-[220px] bg-white/5 flex items-center justify-center text-white/20 text-4xl">∑</div>
        )}
      </div>

      {/* Content */}
      <div className="w-full md:w-3/5 p-8 overflow-y-auto flex flex-col gap-5">
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <Calendar size={12} />
          <span>{event.date}</span>
          {event.registrations != null && event.registrations > 0 && (
            <>
              <span className="text-white/20">·</span>
              <Users size={12} />
              <span>{event.registrations} registrations</span>
            </>
          )}
        </div>

        <h2 className="text-2xl md:text-3xl font-heading font-bold text-white leading-tight">
          {event.title}
        </h2>

        <p className="text-white/60 text-sm leading-relaxed">
          {event.description}
        </p>

        {event.outcome && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-[10px] uppercase tracking-[3px] text-white/25 mb-2">Details</p>
            <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{event.outcome}</p>
          </div>
        )}

        {event.activities && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-[10px] uppercase tracking-[3px] text-white/25 mb-2">Activities</p>
            <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{event.activities}</p>
          </div>
        )}

        {event.highlights && (
          <div className="border-t border-white/10 pt-4 flex items-start gap-2">
            <Star size={13} className="text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-white/50 text-sm leading-relaxed">{event.highlights}</p>
          </div>
        )}

        {event.youtube_link && (
          <a
            href={event.youtube_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest uppercase py-3.5 hover:bg-red-600/30 transition-colors mt-auto"
          >
            <Youtube size={14} /> Watch on YouTube
          </a>
        )}
      </div>
    </motion.div>
  </motion.div>
);

interface EventsProps {
  status: 'upcoming' | 'current' | 'past';
}

const TITLES = {
  upcoming: { label: 'Upcoming', accent: 'Events', sub: 'Events coming up — register early and get ready.' },
  current:  { label: 'Current',  accent: 'Events', sub: 'Happening right now — join in before it ends.' },
  past:     { label: 'Past',     accent: 'Events', sub: 'A look back at everything we have hosted.' },
};

const Events: React.FC<EventsProps> = ({ status }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<EventItem | null>(null);

  useEffect(() => {
    const fetchAndPromote = async () => {
      // Auto-promote upcoming events whose event_datetime has passed
      await supabase
        .from('events')
        .update({ status: 'current' })
        .eq('status', 'upcoming')
        .lte('event_datetime', new Date().toISOString())
        .not('event_datetime', 'is', null);

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('status', status)
        .order('id', { ascending: false });
      setEvents(data ?? []);
      setLoading(false);
    };
    fetchAndPromote();
  }, [status]);

  const filtered = events.filter(
    (e) =>
      search === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase())
  );

  const { label, accent, sub } = TITLES[status];

  return (
    <>
      {selected && (
        <style>{`nav { display: none !important; }`}</style>
      )}

      <div className="min-h-screen text-white pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-5xl sm:text-6xl font-bold font-heading mb-4">
              {label} <span className="text-green-400">{accent}</span>
            </h1>
            <p className="text-white/50 text-base max-w-xl mx-auto mb-8">{sub}</p>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events…"
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-5 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </motion.div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-green-500/40 border-t-green-400 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">
                {status === 'upcoming' ? '🗓️' : status === 'current' ? '⚡' : '📚'}
              </p>
              <p className="text-white/40 text-sm">
                {search
                  ? 'No events match your search.'
                  : status === 'upcoming'
                  ? 'No upcoming events right now. Check back soon!'
                  : status === 'current'
                  ? 'No events happening right now.'
                  : 'No past events to show.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelected(event)}
                  className="bg-[#111111] border border-white/[0.08] rounded-xl overflow-hidden hover:border-white/20 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40 transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  <div className="h-52 overflow-hidden bg-white/5">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 text-6xl">∑</div>
                    )}
                  </div>

                  <div className="px-5 pt-4 pb-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/20 text-white/70 group-hover:border-green-400/50 group-hover:text-green-400 transition-colors capitalize">
                        {event.status}
                      </span>
                      <span className="text-[11px] text-white/35">{event.date}</span>
                    </div>
                    <h2 className="text-lg font-heading font-bold text-white mb-2 leading-snug group-hover:text-yellow-300 transition-colors">
                      {event.title}
                    </h2>
                    <p className="text-white/45 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs text-white/30">
                      <span>Click to view details</span>
                      {event.registrations != null && event.registrations > 0 && (
                        <span className="flex items-center gap-1"><Users size={11} /> {event.registrations}</span>
                      )}
                    </div>
                    {(event.status === 'upcoming' || event.status === 'current') && (
                      <Link
                        href={`/events/${event.id}/register`}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-semibold rounded-lg hover:bg-green-600/30 transition-colors"
                      >
                        <UserPlus size={13} /> Register
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <EventModal event={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Events;
