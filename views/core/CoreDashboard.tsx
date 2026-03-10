'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import ScannerModal from '@/components/core/ScannerModal';
import { QrCode, Users, ChevronRight, Radio, Settings } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  status: string;
  sessions_enabled: number;
  active_session: number;
  registrations: number | null;
}

export default function CoreDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanEvent, setScanEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, date, status, sessions_enabled, active_session, registrations')
      .eq('status', 'current')
      .order('id', { ascending: false });
    if (!error && data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const updateSession = async (eventId: number, field: 'active_session' | 'sessions_enabled', value: number) => {
    await supabase.from('events').update({ [field]: value }).eq('id', eventId);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, [field]: value } : e));
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#30363d] border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
            </span>
            <h1 className="text-2xl font-bold text-white">Live Events</h1>
          </div>
          <p className="text-[#7d8590] text-sm">Scan QR codes to mark attendance</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center mini-h-[40vh] py-24 gap-4">
          <Radio size={48} className="text-[#30363d]" />
          <p className="text-[#7d8590] text-center">No live events right now.</p>
          <Link href="/core/upcoming" className="text-blue-400 hover:text-blue-300 text-sm underline">
            View upcoming events →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map(event => (
            <div key={event.id} className="bg-[#161b22] border border-blue-500/30 rounded-2xl overflow-hidden">
              {/* Event Header */}
              <div className="p-6 border-b border-[#21262d]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        LIVE
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{event.title}</h2>
                    <p className="text-[#7d8590] text-sm mt-1">{event.date}</p>
                  </div>
                  {event.registrations !== null && (
                    <div className="flex items-center gap-1.5 text-[#7d8590] text-sm flex-shrink-0">
                      <Users size={14} /> {event.registrations}
                    </div>
                  )}
                </div>
              </div>

              {/* Session Controls */}
              <div className="px-6 py-4 border-b border-[#21262d] bg-[#0d1117]/50">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Sessions enabled */}
                  <div>
                    <p className="text-[#7d8590] text-xs mb-2 flex items-center gap-1.5">
                      <Settings size={11} /> Sessions enabled
                    </p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(n => (
                        <button
                          key={n}
                          onClick={() => updateSession(event.id, 'sessions_enabled', n)}
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                            event.sessions_enabled >= n
                              ? 'bg-blue-600 text-white'
                              : 'bg-[#21262d] text-[#484f58] hover:text-[#7d8590]'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active session */}
                  <div>
                    <p className="text-[#7d8590] text-xs mb-2">Active session (scanning for)</p>
                    <div className="flex gap-1.5">
                      {Array.from({ length: event.sessions_enabled }, (_, i) => i + 1).map(n => (
                        <button
                          key={n}
                          onClick={() => updateSession(event.id, 'active_session', n)}
                          className={`px-3 h-8 rounded-lg text-sm font-bold transition-colors ${
                            event.active_session === n
                              ? 'bg-green-600 text-white'
                              : 'bg-[#21262d] text-[#7d8590] hover:bg-[#30363d]'
                          }`}
                        >
                          Session {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setScanEvent(event)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  <QrCode size={16} />
                  Scan QR — Session {event.active_session}
                </button>
                <Link
                  href={`/core/registrations/${event.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-[#7d8590] hover:text-white rounded-lg transition-colors text-sm"
                >
                  <Users size={14} />
                  Registrations
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scanner Modal */}
      {scanEvent && (
        <ScannerModal
          eventId={scanEvent.id}
          eventTitle={scanEvent.title}
          activeSession={scanEvent.active_session}
          onClose={() => { setScanEvent(null); fetchEvents(); }}
        />
      )}
    </div>
  );
}
