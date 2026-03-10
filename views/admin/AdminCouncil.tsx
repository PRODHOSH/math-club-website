'use client';
import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Member {
  id: number; name: string; role: string; photo: string; bio: string;
  linkedin: string; github: string; instagram: string; sort_order: number;
}
const EMPTY: Omit<Member, 'id'> = { name: '', role: '', photo: '/council/placeholder.jpg', bio: '', linkedin: '', github: '', instagram: '', sort_order: 0 };

export default function AdminCouncil() {
  const [rows, setRows] = useState<Member[]>([]);
  const [filtered, setFiltered] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => { const { data } = await supabase.from('council').select('*').order('sort_order'); setRows((data as Member[]) ?? []); };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(rows.filter(r => r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q)));
  }, [rows, search]);

  const f = (k: keyof typeof form, v: string | number) => setForm(p => ({ ...p, [k]: v }));
  const openEdit = (r: Member) => { setEditing(r); setForm({ name: r.name, role: r.role, photo: r.photo, bio: r.bio, linkedin: r.linkedin, github: r.github, instagram: r.instagram, sort_order: r.sort_order }); setOpen(true); };
  const save = async () => {
    setSaving(true);
    if (editing) await supabase.from('council').update(form).eq('id', editing.id);
    else await supabase.from('council').insert(form);
    setSaving(false); setOpen(false); load();
  };
  const remove = async (id: number) => { await supabase.from('council').delete().eq('id', id); setDeleteId(null); load(); };

  const inp = 'w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] transition-colors placeholder:text-[#7d8590]';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-semibold">Council</h1><p className="text-white/40 text-sm mt-0.5">{rows.length} members</p></div>
        <button onClick={() => { setEditing(null); setForm(EMPTY); setOpen(true); }} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"><Plus size={15} />Add Member</button>
      </div>
      <div className="relative mb-5 max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-4 py-2 text-sm text-[#f0f6fc] placeholder:text-[#7d8590] focus:outline-none focus:border-[#58a6ff] transition-colors" /></div>

      <div className="rounded-md overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="border-b border-[#21262d] text-[#7d8590] text-xs uppercase tracking-wider bg-[#161b22]">
          <th className="text-left px-5 py-3">Photo</th><th className="text-left px-5 py-3">Name</th><th className="text-left px-5 py-3">Role</th><th className="text-left px-5 py-3">Order</th><th className="px-5 py-3" /></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-[#21262d] bg-[#161b22] hover:bg-[#21262d] transition-colors">
                <td className="px-5 py-3"><img src={r.photo} alt={r.name} className="w-8 h-8 rounded-full object-cover bg-white/10" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /></td>
                <td className="px-5 py-3 font-medium">{r.name}</td>
                <td className="px-5 py-3 text-white/60">{r.role}</td>
                <td className="px-5 py-3 text-white/40">{r.sort_order}</td>
                <td className="px-5 py-3 text-right"><div className="flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(r)} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-[#7d8590]">No members found.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-md p-6 my-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[#f0f6fc]">{editing ? 'Edit Member' : 'Add Member'}</h2>
              <button onClick={() => setOpen(false)} className="text-[#7d8590] hover:text-[#f0f6fc] transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[['Name','name','Full name'],['Role / Position','role','e.g. Chairperson'],['Photo URL','photo','/council/photo.jpg'],['LinkedIn','linkedin','https://linkedin.com/in/…'],['GitHub','github','https://github.com/…'],['Instagram','instagram','https://instagram.com/…']].map(([label,key,ph]) => (
                <div key={key}><label className="block text-xs text-white/50 mb-1.5">{label}</label><input value={form[key as keyof typeof form] as string} onChange={e => f(key as keyof typeof form, e.target.value)} className={inp} placeholder={ph} /></div>
              ))}
              <div><label className="block text-xs text-white/50 mb-1.5">Bio</label><textarea value={form.bio} onChange={e => f('bio', e.target.value)} className={inp + ' resize-y min-h-[72px]'} placeholder="Short bio" /></div>
              <div><label className="block text-xs text-white/50 mb-1.5">Display Order</label><input type="number" value={form.sort_order} onChange={e => f('sort_order', Number(e.target.value))} className={inp} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="flex-1 border border-[#30363d] rounded-md py-2 text-sm text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-white text-black rounded-md py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 max-w-sm w-full">
            <h2 className="font-semibold text-[#f0f6fc] mb-2">Remove Council Member?</h2><p className="text-[#7d8590] text-sm mb-5">This cannot be undone.</p>
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
