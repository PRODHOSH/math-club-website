'use client';
import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Contribution { description: string; points: number; }
interface TeamMember {
  id: number; name: string; dept: string;
  reg_no?: string; points?: number; avatar_url?: string;
  contributions: Contribution[];
}

const DEPTS = ['Social', 'Content', 'Events', 'Marketing', 'Research'];
const DEPT_LABELS: Record<string, string> = {
  Social: 'Social Media & Design', Content: 'Content & Outreach',
  Events: 'Event Management', Marketing: 'Marketing', Research: 'Research',
};
const EMPTY_FORM = { name: '', dept: DEPTS[0], reg_no: '', points: '', avatar_url: '' };

export default function AdminTeam() {
  const [rows, setRows] = useState<TeamMember[]>([]);
  const [filtered, setFiltered] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [contribs, setContribs] = useState<Contribution[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    const { data } = await supabase.from('team').select('*').order('name');
    setRows((data as TeamMember[]) ?? []);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(rows.filter(r =>
      (!q || r.name.toLowerCase().includes(q) || (r.reg_no ?? '').toLowerCase().includes(q)) &&
      (deptFilter === 'all' || r.dept === deptFilter)
    ));
  }, [rows, search, deptFilter]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setContribs([]); setOpen(true); };
  const openEdit = (r: TeamMember) => {
    setEditing(r);
    setForm({ name: r.name, dept: r.dept, reg_no: r.reg_no ?? '', points: r.points != null ? String(r.points) : '', avatar_url: r.avatar_url ?? '' });
    setContribs(r.contributions ?? []);
    setOpen(true);
  };

  const addContrib = () => setContribs(p => [...p, { description: '', points: 0 }]);
  const removeContrib = (i: number) => setContribs(p => p.filter((_, idx) => idx !== i));
  const updateContrib = (i: number, key: keyof Contribution, value: string | number) =>
    setContribs(p => p.map((c, idx) => idx === i ? { ...c, [key]: value } : c));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      dept: form.dept,
      reg_no: form.reg_no.trim() || null,
      points: form.points !== '' ? Number(form.points) : null,
      avatar_url: form.avatar_url.trim() || null,
      contributions: contribs.filter(c => c.description.trim()),
    };
    if (editing) await supabase.from('team').update(payload).eq('id', editing.id);
    else await supabase.from('team').insert(payload);
    setSaving(false); setOpen(false); load();
  };

  const remove = async (id: number) => { await supabase.from('team').delete().eq('id', id); setDeleteId(null); load(); };

  const contribTotal = (r: TeamMember) =>
    r.points != null ? r.points : (r.contributions?.reduce((s, c) => s + (c.points || 0), 0) ?? 0);

  const inp = 'w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] transition-colors placeholder:text-[#7d8590]';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-semibold">Team</h1><p className="text-white/40 text-sm mt-0.5">{rows.length} members</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"><Plus size={15} />Add Member</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative max-w-xs flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or reg no…"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-4 py-2 text-sm text-[#f0f6fc] placeholder:text-[#7d8590] focus:outline-none focus:border-[#58a6ff] transition-colors" /></div>
        <div className="flex flex-wrap gap-2">
          {(['all', ...DEPTS]).map(d => (
            <button key={d} onClick={() => setDeptFilter(d)}
              className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${deptFilter === d ? 'bg-white text-black border-white' : 'border-[#30363d] text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d]'}`}>
              {d === 'all' ? 'All' : DEPT_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#21262d] text-[#7d8590] text-xs uppercase tracking-wider bg-[#161b22]">
            <th className="text-left px-5 py-3">Name</th>
            <th className="text-left px-5 py-3">Reg No</th>
            <th className="text-left px-5 py-3">Department</th>
            <th className="text-left px-5 py-3">Points</th>
            <th className="text-left px-5 py-3">Contributions</th>
            <th className="px-5 py-3" />
          </tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-[#21262d] bg-[#161b22] hover:bg-[#21262d] transition-colors">
                <td className="px-5 py-3 font-medium">{r.name}</td>
                <td className="px-5 py-3 text-white/50 font-mono text-xs">{r.reg_no || '—'}</td>
                <td className="px-5 py-3 text-white/60">{DEPT_LABELS[r.dept] ?? r.dept}</td>
                <td className="px-5 py-3"><span className="text-yellow-400 font-semibold">{contribTotal(r)}</span></td>
                <td className="px-5 py-3 text-white/40 text-xs">{r.contributions?.length ?? 0} item{(r.contributions?.length ?? 0) !== 1 ? 's' : ''}</td>
                <td className="px-5 py-3 text-right"><div className="flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(r)} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-[#7d8590]">No members found.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-lg p-6 my-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[#f0f6fc]">{editing ? 'Edit Member' : 'Add Team Member'}</h2>
              <button onClick={() => setOpen(false)} className="text-[#7d8590] hover:text-[#f0f6fc] transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Name <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inp} placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Department</label>
                  <select value={form.dept} onChange={e => setForm(p => ({ ...p, dept: e.target.value }))} className={inp + ' bg-[#0d1117]'}>
                    {DEPTS.map(d => <option key={d} value={d}>{DEPT_LABELS[d]}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Registration No</label>
                  <input value={form.reg_no} onChange={e => setForm(p => ({ ...p, reg_no: e.target.value }))} className={inp} placeholder="23BCE1234" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Points <span className="text-white/25">(override)</span></label>
                  <input type="number" min="0" value={form.points} onChange={e => setForm(p => ({ ...p, points: e.target.value }))} className={inp} placeholder="Auto-sum if blank" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Avatar URL <span className="text-white/25">(optional)</span></label>
                <input value={form.avatar_url} onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))} className={inp} placeholder="https://..." />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/50">Contributions</label>
                  <button onClick={addContrib} className="flex items-center gap-1 text-xs text-[#58a6ff] hover:text-[#79b8ff] transition-colors">
                    <Plus size={12} /> Add
                  </button>
                </div>
                {contribs.length === 0 ? (
                  <p className="text-[#7d8590] text-xs py-3 text-center bg-[#0d1117] border border-dashed border-[#30363d] rounded-md">
                    No contributions yet — click Add to start.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {contribs.map((c, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          value={c.description}
                          onChange={e => updateContrib(i, 'description', e.target.value)}
                          className={inp + ' flex-1'}
                          placeholder="What did they do?"
                        />
                        <div className="w-24 shrink-0">
                          <input
                            type="number" min="0"
                            value={c.points}
                            onChange={e => updateContrib(i, 'points', Number(e.target.value))}
                            className={inp}
                            placeholder="pts"
                          />
                        </div>
                        <button onClick={() => removeContrib(i)} className="text-[#7d8590] hover:text-red-400 transition-colors shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {contribs.length > 0 && (
                  <p className="text-xs text-[#7d8590] mt-2 text-right">
                    Total: <span className="text-yellow-400 font-semibold">{contribs.reduce((s, c) => s + (Number(c.points) || 0), 0)} pts</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="flex-1 border border-[#30363d] rounded-md py-2 text-sm text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors">Cancel</button>
              <button onClick={save} disabled={saving || !form.name.trim()} className="flex-1 bg-white text-black rounded-md py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 max-w-sm w-full">
            <h2 className="font-semibold text-[#f0f6fc] mb-2">Remove Team Member?</h2>
            <p className="text-[#7d8590] text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-[#30363d] rounded-md py-2 text-sm text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors">Cancel</button>
              <button onClick={() => remove(deleteId)} className="flex-1 bg-red-600 hover:bg-red-500 rounded-md py-2 text-sm font-medium transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}