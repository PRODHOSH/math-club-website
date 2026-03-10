'use client';
import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Tutorial {
  id: number;
  name: string;
  course: string;
  module: number;
  questions_link: string;
  solutions_link: string;
}

const COURSES = ['Calculus', 'Linear Algebra', 'Discrete Mathematics', 'Probability & Statistics'];
const EMPTY: Omit<Tutorial, 'id'> = { name: '', course: COURSES[0], module: 1, questions_link: '#', solutions_link: '#' };

export default function AdminTutorials() {
  const [rows, setRows] = useState<Tutorial[]>([]);
  const [filtered, setFiltered] = useState<Tutorial[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    const { data } = await supabase.from('tutorials').select('*').order('id');
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(rows.filter(r => r.name.toLowerCase().includes(q) || r.course.toLowerCase().includes(q) || String(r.module).includes(q)));
  }, [rows, search]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (r: Tutorial) => { setEditing(r); setForm({ name: r.name, course: r.course, module: r.module, questions_link: r.questions_link, solutions_link: r.solutions_link }); setOpen(true); };
  const save = async () => {
    setSaving(true);
    if (editing) await supabase.from('tutorials').update(form).eq('id', editing.id);
    else await supabase.from('tutorials').insert(form);
    setSaving(false); setOpen(false); load();
  };
  const remove = async (id: number) => { await supabase.from('tutorials').delete().eq('id', id); setDeleteId(null); load(); };

  const inp = 'w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] transition-colors placeholder:text-[#7d8590]';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-semibold">Tutorials</h1><p className="text-white/40 text-sm mt-0.5">{rows.length} total</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"><Plus size={15} />Add Tutorial</button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tutorials…" className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-4 py-2 text-sm text-[#f0f6fc] placeholder:text-[#7d8590] focus:outline-none focus:border-[#58a6ff] transition-colors" />
      </div>

      <div className="rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#21262d] text-[#7d8590] text-xs uppercase tracking-wider bg-[#161b22]">
            <th className="text-left px-5 py-3">Name</th><th className="text-left px-5 py-3">Course</th><th className="text-left px-5 py-3">Module</th><th className="text-left px-5 py-3">Links</th><th className="px-5 py-3" />
          </tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-[#21262d] bg-[#161b22] hover:bg-[#21262d] transition-colors">
                <td className="px-5 py-3 font-medium">{r.name}</td>
                <td className="px-5 py-3 text-white/60">{r.course}</td>
                <td className="px-5 py-3 text-white/60">Module {r.module}</td>
                <td className="px-5 py-3 space-x-3 text-xs">
                  <a href={r.questions_link} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white underline underline-offset-2">Questions</a>
                  <a href={r.solutions_link} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white underline underline-offset-2">Solutions</a>
                </td>
                <td className="px-5 py-3 text-right"><div className="flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(r)} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-[#7d8590]">No tutorials found.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[#f0f6fc]">{editing ? 'Edit Tutorial' : 'Add Tutorial'}</h2>
              <button onClick={() => setOpen(false)} className="text-[#7d8590] hover:text-[#f0f6fc] transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs text-white/50 mb-1.5">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} placeholder="Tutorial name" /></div>
              <div><label className="block text-xs text-white/50 mb-1.5">Course</label>
                <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} className={inp + ' bg-[#111]'}>{COURSES.map(c => <option key={c}>{c}</option>)}</select>
              </div>
              <div><label className="block text-xs text-white/50 mb-1.5">Module</label>
                <select value={form.module} onChange={e => setForm({ ...form, module: Number(e.target.value) })} className={inp + ' bg-[#111]'}>{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>Module {n}</option>)}</select>
              </div>
              <div><label className="block text-xs text-white/50 mb-1.5">Questions PDF Link</label><input value={form.questions_link} onChange={e => setForm({ ...form, questions_link: e.target.value })} className={inp} placeholder="https://…" /></div>
              <div><label className="block text-xs text-white/50 mb-1.5">Solutions PDF Link</label><input value={form.solutions_link} onChange={e => setForm({ ...form, solutions_link: e.target.value })} className={inp} placeholder="https://…" /></div>
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
            <h2 className="font-semibold text-[#f0f6fc] mb-2">Delete Tutorial?</h2>
            <p className="text-[#7d8590] text-sm mb-5">This cannot be undone.</p>
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
