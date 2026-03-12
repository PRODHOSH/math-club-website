'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { QrCode, Calendar, Settings, Radio, Clock, ChevronRight, User } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  status: 'current' | 'upcoming' | 'past';
  sessions_enabled: number;
}

export default function CoordinatorDashboard() {
  const [user, setUser]                 = useState<{ email: string; name?: string } | null>(null);
  const [liveEvents, setLiveEvents]     = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          email: authUser.email ?? '',
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
        });
      }
      const { data } = await supabase
        .from('events')
        .select('id, title, date, status, sessions_enabled')
        .in('status', ['current', 'upcoming'])
        .order('id', { ascending: false });
      if (data) {
        setLiveEvents(data.filter((e: Event) => e.status === 'current'));
        setUpcomingEvents(data.filter((e: Event) => e.status === 'upcoming'));
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#30363d] border-t-[#7d8590] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Welcome card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center">
              <User size={18} className="text-[#7d8590]" />
            </div>
            <div>
              <p className="text-white font-semibold">{user?.name || 'Coordinator'}</p>
              <p className="text-[#7d8590] text-sm">{user?.email}</p>
            </div>
          </div>
          <Link
            href="/coordinator/settings"
            className="flex items-center gap-1.5 text-[#7d8590] hover:text-white text-xs transition-colors border border-[#30363d] hover:border-[#484f58] rounded-md px-3 py-1.5"
          >
            <Settings size={13} /> Settings
          </Link>
        </div>
        <div className="mt-4 pt-4 border-t border-[#21262d]">
          <p className="text-[#7d8590] text-xs">
            Select a live event below to scan QR codes and manage attendance.
          </p>
        </div>
      </div>

      {/* Live events */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Live Events</h2>
        </div>
        {liveEvents.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-6 text-center text-[#484f58] text-sm">
            <Radio size={24} className="mx-auto mb-2 text-[#30363d]" />
            No live events right now.
          </div>
        ) : (
          <div className="space-y-2">
            {liveEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}
      </section>

      {/* Upcoming events */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <Clock size={14} className="text-[#7d8590]" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Upcoming Events</h2>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-6 text-center text-[#484f58] text-sm">
            <Calendar size={24} className="mx-auto mb-2 text-[#30363d]" />
            No upcoming events.
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const isLive = event.status === 'current';
  return (
    <Link
      href={`/coordinator/event/${event.id}`}
      className="flex items-center justify-between bg-[#161b22] border border-[#30363d] hover:border-[#484f58] rounded-lg px-4 py-3.5 group transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isLive ? 'bg-green-500/10' : 'bg-[#21262d]'
        }`}>
          {isLive
            ? <Radio size={15} className="text-green-400" />
            : <Calendar size={15} className="text-[#7d8590]" />
          }
        </div>
        <div>
          <p className="text-white text-sm font-medium">{event.title}</p>
          <p className="text-[#7d8590] text-xs mt-0.5">
            {event.date} &middot; {event.sessions_enabled} session{event.sessions_enabled > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
          isLive ? 'bg-green-500/10 text-green-400' : 'bg-[#21262d] text-[#7d8590]'
        }`}>
          {isLive ? 'Live' : 'Upcoming'}
        </span>
        <QrCode size={14} className="text-[#484f58] group-hover:text-[#7d8590] transition-colors" />
        <ChevronRight size={14} className="text-[#484f58] group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}