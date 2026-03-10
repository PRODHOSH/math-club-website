'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Users, Calendar, BookOpen, UserCircle2, ExternalLink } from 'lucide-react';

async function getCount(table: string) {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
  return count ?? 0;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ tutorials: 0, events: 0, council: 0, team: 0 });
  const [recruitmentOpen, setRecruitmentOpen] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      getCount('tutorials'),
      getCount('events'),
      getCount('council'),
      getCount('team'),
    ]).then(([tutorials, events, council, team]) => {
      setCounts({ tutorials, events, council, team });
    });

    supabase.from('settings').select('value').eq('key', 'recruitment_open').single()
      .then(({ data }) => setRecruitmentOpen(data?.value === 'true'));
  }, []);

  const toggleRecruitment = async () => {
    if (recruitmentOpen === null || toggling) return;
    setToggling(true);
    const next = !recruitmentOpen;
    await supabase.from('settings').upsert({ key: 'recruitment_open', value: next ? 'true' : 'false' });
    setRecruitmentOpen(next);
    setToggling(false);
  };

  const insightCards = [
    { label: 'Tutorials',    value: counts.tutorials, icon: BookOpen,     color: 'text-purple-400',  bg: 'bg-purple-500/10', href: 'tutorials' },
    { label: 'Events',       value: counts.events,    icon: Calendar,     color: 'text-blue-400',    bg: 'bg-blue-500/10',   href: 'events' },
    { label: 'Council',      value: counts.council,   icon: UserCircle2,  color: 'text-yellow-400',  bg: 'bg-yellow-500/10', href: 'council' },
    { label: 'Team Members', value: counts.team,      icon: Users,        color: 'text-green-400',   bg: 'bg-green-500/10',  href: 'team' },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <img src="/math-club-logo.jpeg" alt="Math Club" className="w-10 h-10 rounded-xl object-cover border border-yellow-500/20" />
        <div>
          <h1 className="text-xl font-semibold text-[#f0f6fc] leading-none">Dashboard</h1>
          <p className="text-[#7d8590] text-xs mt-0.5">Mathematics Club · VIT Chennai</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {insightCards.map(s => (
          <a
            key={s.label}
            href={`/admin/${s.href}`}
            className="group block bg-[#161b22] border border-[#21262d] rounded-xl p-5 hover:bg-[#21262d] hover:border-[#30363d] transition-all"
          >
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-3xl font-bold text-[#f0f6fc] mb-0.5">{s.value}</p>
            <p className="text-[#7d8590] text-xs">{s.label}</p>
          </a>
        ))}
      </div>

      {/* Insights */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-widest mb-3">Insights</p>
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#f0f6fc] text-sm font-medium mb-2">
            <TrendingUp size={15} className="text-yellow-400" />
            Content Breakdown
          </div>
          {insightCards.map(s => (
            <div key={s.label}>
              <div className="flex justify-between text-xs text-[#7d8590] mb-1">
                <span>{s.label}</span>
                <span className={s.color}>{s.value}</span>
              </div>
              <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${s.color.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.round((s.value / Math.max(counts.tutorials, counts.events, counts.council, counts.team, 1)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          <div className="pt-3 border-t border-[#21262d] flex justify-between text-xs text-[#7d8590]">
            <span>Total entries across all sections</span>
            <span className="text-[#f0f6fc] font-semibold">{counts.tutorials + counts.events + counts.council + counts.team}</span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {insightCards.map(s => (
            <a
              key={s.label}
              href={`/admin/${s.href}`}
              className="flex items-center gap-2 bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2.5 text-xs text-[#7d8590] hover:text-[#f0f6fc] hover:border-[#30363d] transition-all group"
            >
              <s.icon size={13} className={s.color} />
              <span>Manage {s.label}</span>
              <ExternalLink size={11} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>

      {/* Recruitment toggle */}
      <div>
        <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-widest mb-3">Recruitment</p>
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#f0f6fc]">Recruitment Portal</p>
            <p className="text-xs text-[#7d8590] mt-0.5">
              {recruitmentOpen === null
                ? 'Loading...'
                : recruitmentOpen
                  ? 'Open — students can submit applications'
                  : 'Closed — applications are disabled'}
            </p>
          </div>
          <button
            onClick={toggleRecruitment}
            disabled={toggling || recruitmentOpen === null}
            title={recruitmentOpen ? 'Close recruitment' : 'Open recruitment'}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-40 focus:outline-none ${
              recruitmentOpen ? 'bg-green-600' : 'bg-[#30363d]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                recruitmentOpen ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
