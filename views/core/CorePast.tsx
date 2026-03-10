'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Calendar, Users, ChevronRight, History } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  registrations: number | null;
  sessions_enabled: number;
}

export default function CorePast() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('events')
      .select('id, title, date, registrations, sessions_enabled')
      .eq('status', 'past')
      .order('id', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setEvents(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <History size={20} className="text-[#7d8590]" />
          <h1 className="text-2xl font-bold text-white">Past Events</h1>
        </div>
        <p className="text-[#7d8590] text-sm">View and export attendance records</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#30363d] border-t-[#7d8590] rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center text-[#7d8590] py-24">No past events.</div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold">{event.title}</p>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="flex items-center gap-1.5 text-[#7d8590] text-xs">
                    <Calendar size={11} /> {event.date}
                  </span>
                  {event.registrations !== null && (
                    <span className="flex items-center gap-1.5 text-[#7d8590] text-xs">
                      <Users size={11} /> {event.registrations}
                    </span>
                  )}
                  <span className="text-xs text-[#484f58]">
                    {event.sessions_enabled} session{event.sessions_enabled > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <Link
                href={`/core/registrations/${event.id}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#7d8590] hover:text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0"
              >
                <Users size={13} /> Records <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
