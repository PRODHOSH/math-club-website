'use client';
import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Event {
  id: number; title: string; date: string; description: string;
  image: string; status: 'upcoming' | 'current' | 'past';
  outcome: string; activities: string; registrations: string;
  youtube_link: string; highlights: string; event_datetime: string;
}
const EMPTY: Omit<Event, 'id'> = { title: '', date: '', description: '', image: '/events/placeholder.jpg', status: 'upcoming', outcome: '', activities: '', registrations: '', youtube_link: '', highlights: '', event_datetime: '' };
const STATUS_OPTS = ['upcoming', 'current', 'past'] as const;
const statusColor = (s: string) => s === 'upcoming' ? 'bg-blue-500/15 text-blue-300 border-blue-500/25' : s === 'current' ? 'bg-green-500/15 text-green-300 border-green-500/25' : 'bg-white/10 text-white/50 border-white/15';

export default function AdminEvents() {
  const [rows, setRows] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | typeof STATUS_OPTS[number]>('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const load = async () => { const { data } = await supabase.from('events').select('*').order('id'); setRows((data as Event[]) ?? []); };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(rows.filter(r => (r.title.toLowerCase().includes(q) || r.date.toLowerCase().includes(q)) && (statusFilter === 'all' || r.status === statusFilter)));
  }, [rows, search, statusFilter]);

  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const handleDateTime = (d: string, t: string) => {
    const combined = d && t ? `${d}T${t}` : d ? `${d}T00:00` : '';
    const displayDate = d ? new Date(d + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    setForm(p => ({ ...p, event_datetime: combined, date: displayDate || d }));
  };
  const openEdit = (r: Event) => {
    setSaveError('');
    setEditing(r);
    setForm({ title: r.title, date: r.date, description: r.description, image: r.image, status: r.status, outcome: r.outcome, activities: r.activities, registrations: r.registrations, youtube_link: r.youtube_link, highlights: r.highlights, event_datetime: r.event_datetime || '' });
    if (r.event_datetime) {
      const dt = r.event_datetime.substring(0, 16);
      setEventDate(dt.substring(0, 10));
      setEventTime(dt.substring(11, 16));
    } else { setEventDate(''); setEventTime(''); }
    setOpen(true);
  };
  const save = async () => {
    setSaving(true);
    setSaveError('');
    const { error } = editing
      ? await supabase.from('events').update(form).eq('id', editing.id)
      : await supabase.from('events').insert(form);
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    setOpen(false); load();
  };
  const remove = async (id: number) => { await supabase.from('events').delete().eq('id', id); setDeleteId(null); load(); };

  const inp = 'w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] transition-colors placeholder:text-[#7d8590]';
  const field = (label: string, key: keyof typeof form, ph?: string, ta?: boolean) => (
    <div key={key}><label className="block text-xs text-white/50 mb-1.5">{label}</label>
      {ta ? <textarea value={form[key] as string} onChange={e => f(key, e.target.value)} className={inp + ' resize-y min-h-[72px]'} placeholder={ph} />
           : <input value={form[key] as string} onChange={e => f(key, e.target.value)} className={inp} placeholder={ph} />}
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-semibold">Events</h1><p className="text-white/40 text-sm mt-0.5">{rows.length} total</p></div>
        <button onClick={() => { setEditing(null); setForm(EMPTY); setEventDate(''); setEventTime(''); setOpen(true); }} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"><Plus size={15} />Add Event</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative max-w-xs flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…" className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-4 py-2 text-sm text-[#f0f6fc] placeholder:text-[#7d8590] focus:outline-none focus:border-[#58a6ff] transition-colors" /></div>
        <div className="flex gap-2">{(['all', ...STATUS_OPTS] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-md text-xs border transition-colors capitalize ${statusFilter === s ? 'bg-white text-black border-white' : 'border-[#30363d] text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d]'}`}>{s}</button>
        ))}</div>
      </div>

      <div className="rounded-md overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="border-b border-[#21262d] text-[#7d8590] text-xs uppercase tracking-wider bg-[#161b22]">
          <th className="text-left px-5 py-3">Title</th><th className="text-left px-5 py-3">Date</th><th className="text-left px-5 py-3">Status</th><th className="px-5 py-3" /></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-[#21262d] bg-[#161b22] hover:bg-[#21262d] transition-colors">
                <td className="px-5 py-3 font-medium">{r.title}</td>
                <td className="px-5 py-3 text-white/60">{r.date}</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColor(r.status)}`}>{r.status}</span></td>
                <td className="px-5 py-3 text-right"><div className="flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(r)} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-[#7d8590]">No events found.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-2xl my-8">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d]">
              <h2 className="font-semibold text-base text-[#f0f6fc]">{editing ? 'Edit Event' : 'Add Event'}</h2>
              <button onClick={() => setOpen(false)} className="text-[#7d8590] hover:text-[#f0f6fc] p-1 rounded-md hover:bg-[#21262d] transition-colors"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              {field('Event Name', 'title', 'e.g. Math Olympiad 2026')}
              {field('Short Description', 'description', 'One-line summary shown on event cards', true)}
              {field('Detailed Description', 'outcome', 'Full details, agenda, what to expect…', true)}
              {field('Image URL', 'image', '/events/filename.jpg or https://…')}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-white/50 mb-1.5">Date</label>
                  <input type="date" value={eventDate} onChange={e => { setEventDate(e.target.value); handleDateTime(e.target.value, eventTime); }} className={inp} />
                </div>
                <div><label className="block text-xs text-white/50 mb-1.5">Time</label>
                  <input type="time" value={eventTime} onChange={e => { setEventTime(e.target.value); handleDateTime(eventDate, e.target.value); }} className={inp} />
                </div>
              </div>
              {field('Venue', 'activities', 'e.g. Auditorium, Block A')}
              {field('Coordinator & Phone', 'highlights', 'e.g. Arjun Kumar — +91 98765 43210')}
              <div><label className="block text-xs text-white/50 mb-1.5">Status</label>
                <div className="flex gap-2">
                  {STATUS_OPTS.map(s => (
                    <button key={s} type="button" onClick={() => f('status', s)}
                      className={`flex-1 py-2 rounded-md text-xs capitalize border transition-colors ${form.status === s ? 'bg-white text-black border-white' : 'border-[#30363d] text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            {saveError && <p className="mx-6 mb-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{saveError}</p>}
            <div className="flex gap-3 px-6 py-4 border-t border-[#21262d]">
              <button onClick={() => setOpen(false)} className="flex-1 border border-[#30363d] rounded-md py-2.5 text-sm text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-white text-black rounded-md py-2.5 text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-colors">{saving ? 'Saving…' : 'Save Event'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 max-w-sm w-full">
            <h2 className="font-semibold text-[#f0f6fc] mb-2">Delete Event?</h2><p className="text-[#7d8590] text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-[#30363d] rounded-md py-2 text-sm text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 bg-red-600 hover:bg-red-500 rounded-md py-2 text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
