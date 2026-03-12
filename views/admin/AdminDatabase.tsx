'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Database, Plus, Trash2, Download, Upload, X, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Event {
  id: number; title: string; date: string; status: string; sessions_enabled: number;
}
interface Reg {
  id: string; name: string; reg_no: string; email: string;
  att_1_at: string | null; att_2_at: string | null; att_3_at: string | null;
}

const EMPTY_ROW = { name: '', reg_no: '', email: '' };

export default function AdminDatabase() {
  const [events, setEvents]               = useState<Event[]>([]);
  const [selected, setSelected]           = useState<Event | null>(null);
  const [regs, setRegs]                   = useState<Reg[]>([]);
  const [loading, setLoading]             = useState(true);
  const [regsLoading, setRegsLoading]     = useState(false);
  const fileRef                           = useRef<HTMLInputElement>(null);

  const [showAddModal, setShowAddModal]   = useState(false);
  const [addForm, setAddForm]             = useState(EMPTY_ROW);
  const [addSaving, setAddSaving]         = useState(false);
  const [addError, setAddError]           = useState('');

  const [deleteId, setDeleteId]           = useState<string | null>(null);
  const [deleteError, setDeleteError]     = useState('');

  const [confirmClear, setConfirmClear]   = useState(false);
  const [clearing, setClearing]           = useState(false);
  const [clearError, setClearError]       = useState('');

  const [importing, setImporting]         = useState(false);
  const [importResult, setImportResult]   = useState<{ added: number; skipped: number; errors: string[] } | null>(null);

  const loadEvents = async () => {
    const { data } = await supabase.from('events')
      .select('id, title, date, status, sessions_enabled')
      .order('id', { ascending: false });
    setEvents((data as Event[]) ?? []);
    setLoading(false);
  };

  const loadRegs = async (ev: Event) => {
    setRegsLoading(true);
    const { data } = await supabase.from('registrations').select('*').eq('event_id', ev.id).order('reg_no');
    setRegs((data as Reg[]) ?? []);
    setRegsLoading(false);
  };

  useEffect(() => { loadEvents(); }, []);

  const selectEvent = (ev: Event) => {
    setSelected(ev); loadRegs(ev); setImportResult(null);
  };

  const updateSessions = async (n: number) => {
    if (!selected) return;
    await supabase.from('events').update({ sessions_enabled: n }).eq('id', selected.id);
    const updated = { ...selected, sessions_enabled: n };
    setSelected(updated);
    setEvents(prev => prev.map(e => e.id === selected.id ? updated : e));
  };

  const addRow = async () => {
    if (!selected) return;
    if (!addForm.name.trim() || !addForm.reg_no.trim() || !addForm.email.trim()) {
      setAddError('All fields are required.'); return;
    }
    setAddSaving(true); setAddError('');
    const { error } = await supabase.from('registrations').insert({
      event_id: selected.id,
      name: addForm.name.trim(),
      reg_no: addForm.reg_no.trim().toUpperCase(),
      email: addForm.email.trim().toLowerCase(),
    });
    if (error) setAddError(error.code === '23505' ? 'Already exists.' : error.message);
    else { setShowAddModal(false); setAddForm(EMPTY_ROW); loadRegs(selected); }
    setAddSaving(false);
  };

  const deleteRow = async (id: string) => {
    setDeleteError('');
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) { setDeleteError(error.message); return; }
    setDeleteId(null); if (selected) loadRegs(selected);
  };

  const clearAll = async () => {
    if (!selected) return;
    setClearing(true); setClearError('');
    const { error } = await supabase.from('registrations').delete().eq('event_id', selected.id);
    setClearing(false);
    if (error) { setClearError(error.message); return; }
    setConfirmClear(false); loadRegs(selected);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setImportResult(null);
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    const resolve = (row: Record<string, string>, keys: string[]) => {
      for (const k of keys) {
        const found = Object.keys(row).find(r => r.toLowerCase().replace(/[^a-z0-9]/g, '') === k);
        if (found && row[found]) return String(row[found]).trim();
      }
      return '';
    };
    let added = 0, skipped = 0;
    const errors: string[] = [];
    for (const row of rows) {
      const name  = resolve(row, ['name', 'fullname', 'studentname']);
      const regno = resolve(row, ['id', 'regno', 'regid', 'registerno', 'registrationnumber', 'rollno']);
      const email = resolve(row, ['email', 'emailid', 'mail']);
      if (!name || !regno || !email) { errors.push('Skipped (missing fields): ' + JSON.stringify(row)); skipped++; continue; }
      const { error } = await supabase.from('registrations').insert({
        event_id: selected.id, name, reg_no: regno.toUpperCase(), email: email.toLowerCase(),
      });
      if (error) { if (error.code === '23505') skipped++; else { errors.push(regno + ': ' + error.message); skipped++; } }
      else added++;
    }
    setImportResult({ added, skipped, errors: errors.slice(0, 5) });
    setImporting(false); e.target.value = '';
    loadRegs(selected);
  };

  const exportCSV = () => {
    if (!selected) return;
    const s = selected.sessions_enabled;
    const headers = ['Reg No', 'Name', 'Email',
      ...(s >= 1 ? ['Session 1', 'S1 Time'] : []),
      ...(s >= 2 ? ['Session 2', 'S2 Time'] : []),
      ...(s >= 3 ? ['Session 3', 'S3 Time'] : []),
    ];
    const csvRows = regs.map(r => [
      r.reg_no, r.name, r.email,
      ...(s >= 1 ? [r.att_1_at ? 'Present' : 'Absent', r.att_1_at ? new Date(r.att_1_at).toLocaleString() : ''] : []),
      ...(s >= 2 ? [r.att_2_at ? 'Present' : 'Absent', r.att_2_at ? new Date(r.att_2_at).toLocaleString() : ''] : []),
      ...(s >= 3 ? [r.att_3_at ? 'Present' : 'Absent', r.att_3_at ? new Date(r.att_3_at).toLocaleString() : ''] : []),
    ]);
    const q = (v: string) => '"' + v.replace(/"/g, '""') + '"';
    const csv = [headers, ...csvRows].map(r => r.map(c => q(String(c))).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = (selected.title.replace(/\s+/g, '_') || 'attendance') + '.csv'; a.click();
  };

  const sessions = selected?.sessions_enabled ?? 1;

  const statusColor = (s: string) =>
    s === 'current'  ? 'bg-green-500/10 text-green-400' :
    s === 'upcoming' ? 'bg-blue-500/10 text-blue-400' :
    'bg-white/5 text-[#7d8590]';

  if (loading) return (
    <div className="p-8 min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#30363d] border-t-[#7d8590] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Event Databases</h1>
        <p className="text-[#7d8590] text-sm mt-0.5">
          Import and manage registration databases for each event. Coordinators can scan and add/delete rows.
        </p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '260px 1fr' }}>
        {/* Event list */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden self-start">
          <div className="px-4 py-3 border-b border-[#21262d]">
            <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wider">Events</p>
          </div>
          <div className="divide-y divide-[#21262d]">
            {events.length === 0 ? (
              <p className="px-4 py-6 text-[#484f58] text-sm text-center">No events found.</p>
            ) : events.map(ev => (
              <button
                key={ev.id}
                onClick={() => selectEvent(ev)}
                className={`w-full text-left px-4 py-3 transition-colors ${selected?.id === ev.id ? 'bg-[#21262d]' : 'hover:bg-[#0d1117]/50'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[#f0f6fc] text-sm font-medium leading-snug">{ev.title}</p>
                  <span className={`shrink-0 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${statusColor(ev.status)}`}>
                    {ev.status}
                  </span>
                </div>
                <p className="text-[#484f58] text-xs mt-0.5">{ev.date}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        {!selected ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-center h-64">
            <div className="text-center">
              <Database size={32} className="text-[#30363d] mx-auto mb-2" />
              <p className="text-[#7d8590] text-sm">Select an event to manage its registration database.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Controls */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-white font-semibold">{selected.title}</h2>
                  <p className="text-[#7d8590] text-xs mt-0.5">{selected.date}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[#7d8590] text-xs">Sessions:</span>
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      onClick={() => updateSessions(n)}
                      className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                        sessions === n ? 'bg-white text-black' : 'bg-[#21262d] text-[#7d8590] hover:text-white'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileImport} className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={importing}
                  className="flex items-center gap-1.5 border border-[#30363d] text-[#7d8590] hover:text-white text-xs px-3 py-1.5 rounded-md hover:bg-[#21262d] disabled:opacity-50 transition-colors"
                >
                  <Upload size={12} /> {importing ? 'Importing...' : 'Import Excel / CSV'}
                </button>
                <button
                  onClick={() => { setShowAddModal(true); setAddForm(EMPTY_ROW); setAddError(''); }}
                  className="flex items-center gap-1.5 bg-white text-black text-xs font-medium px-3 py-1.5 rounded-md hover:bg-white/90 transition-colors"
                >
                  <Plus size={12} /> Add Row
                </button>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1.5 border border-[#30363d] text-[#7d8590] hover:text-white text-xs px-3 py-1.5 rounded-md hover:bg-[#21262d] transition-colors"
                >
                  <Download size={12} /> Export CSV
                </button>
                <button
                  onClick={() => { setConfirmClear(true); setClearError(''); }}
                  className="flex items-center gap-1.5 border border-red-500/30 text-red-400/70 hover:text-red-400 text-xs px-3 py-1.5 rounded-md hover:bg-red-500/5 transition-colors ml-auto"
                >
                  <Trash2 size={12} /> Clear All
                </button>
              </div>

              {importResult && (
                <div className="mt-3 text-xs bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#7d8590]">
                  Imported: <span className="text-green-400 font-medium">{importResult.added} added</span>, {importResult.skipped} skipped.
                  {importResult.errors.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-red-400">
                      {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Table */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
              {regsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-[#30363d] border-t-[#7d8590] rounded-full animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#21262d]">
                        <th className="text-left px-4 py-3 text-xs text-[#7d8590] font-medium">Reg No</th>
                        <th className="text-left px-4 py-3 text-xs text-[#7d8590] font-medium">Name</th>
                        <th className="text-left px-4 py-3 text-xs text-[#7d8590] font-medium">Email</th>
                        {sessions >= 1 && <th className="text-center px-3 py-3 text-xs text-[#7d8590] font-medium">S1</th>}
                        {sessions >= 2 && <th className="text-center px-3 py-3 text-xs text-[#7d8590] font-medium">S2</th>}
                        {sessions >= 3 && <th className="text-center px-3 py-3 text-xs text-[#7d8590] font-medium">S3</th>}
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {regs.length === 0 ? (
                        <tr><td colSpan={4 + sessions} className="text-center py-10 text-[#484f58] text-sm">No registrations yet. Import or add manually.</td></tr>
                      ) : regs.map(r => (
                        <tr key={r.id} className="border-b border-[#21262d]/60 hover:bg-[#0d1117]/40 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-xs text-[#7d8590]">{r.reg_no}</td>
                          <td className="px-4 py-2.5 text-[#f0f6fc] text-xs">{r.name}</td>
                          <td className="px-4 py-2.5 text-[#7d8590] text-xs">{r.email}</td>
                          {sessions >= 1 && <td className="px-3 py-2.5 text-center">{r.att_1_at ? <CheckCircle size={13} className="text-green-400 mx-auto" title={new Date(r.att_1_at).toLocaleString()} /> : <span className="text-[#30363d] text-xs">—</span>}</td>}
                          {sessions >= 2 && <td className="px-3 py-2.5 text-center">{r.att_2_at ? <CheckCircle size={13} className="text-green-400 mx-auto" title={new Date(r.att_2_at).toLocaleString()} /> : <span className="text-[#30363d] text-xs">—</span>}</td>}
                          {sessions >= 3 && <td className="px-3 py-2.5 text-center">{r.att_3_at ? <CheckCircle size={13} className="text-green-400 mx-auto" title={new Date(r.att_3_at).toLocaleString()} /> : <span className="text-[#30363d] text-xs">—</span>}</td>}
                          <td className="px-2 py-2.5">
                            <button onClick={() => { setDeleteId(r.id); setDeleteError(''); }} className="p-1 text-[#484f58] hover:text-red-400 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADD ROW */}
      {showAddModal && (
        <ModalOverlay onClose={() => { setShowAddModal(false); setAddError(''); }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Add Registration</h2>
            <button onClick={() => { setShowAddModal(false); setAddError(''); }} className="text-[#7d8590] hover:text-white"><X size={16} /></button>
          </div>
          <div className="space-y-3">
            {(['name', 'reg_no', 'email'] as const).map(f => (
              <div key={f}>
                <label className="block text-xs text-[#7d8590] mb-1.5 capitalize">{f.replace('_', ' ')}</label>
                <input
                  value={addForm[f]}
                  onChange={e => setAddForm(p => ({ ...p, [f]: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] transition-colors"
                  suppressHydrationWarning
                />
              </div>
            ))}
            {addError && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{addError}</p>}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setShowAddModal(false); setAddError(''); }} className="flex-1 border border-[#30363d] rounded-md py-2 text-sm text-[#7d8590] hover:text-white hover:bg-[#21262d] transition-colors">Cancel</button>
            <button onClick={addRow} disabled={addSaving} className="flex-1 bg-white text-black rounded-md py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors">
              {addSaving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* DELETE ROW */}
      {deleteId && (
        <ModalOverlay onClose={() => { setDeleteId(null); setDeleteError(''); }}>
          <h2 className="text-white font-semibold mb-2">Remove Registration?</h2>
          <p className="text-[#7d8590] text-sm mb-4">This will permanently delete this record and all attendance data.</p>
          {deleteError && <p className="text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{deleteError}</p>}
          <div className="flex gap-3">
            <button onClick={() => { setDeleteId(null); setDeleteError(''); }} className="flex-1 border border-[#30363d] rounded-md py-2 text-sm text-[#7d8590] hover:text-white hover:bg-[#21262d] transition-colors">Cancel</button>
            <button onClick={() => deleteRow(deleteId)} className="flex-1 bg-red-600 hover:bg-red-500 rounded-md py-2 text-sm font-medium transition-colors">Delete</button>
          </div>
        </ModalOverlay>
      )}

      {/* CLEAR ALL */}
      {confirmClear && (
        <ModalOverlay onClose={() => { setConfirmClear(false); setClearError(''); }}>
          <h2 className="text-white font-semibold mb-2">Clear All Registrations?</h2>
          <p className="text-[#7d8590] text-sm mb-1">{selected?.title}</p>
          <p className="text-[#484f58] text-xs mb-4">Permanently deletes all {regs.length} registrations and attendance data for this event.</p>
          {clearError && <p className="text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{clearError}</p>}
          <div className="flex gap-3">
            <button onClick={() => { setConfirmClear(false); setClearError(''); }} className="flex-1 border border-[#30363d] rounded-md py-2 text-sm text-[#7d8590] hover:text-white hover:bg-[#21262d] transition-colors">Cancel</button>
            <button onClick={clearAll} disabled={clearing} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-md py-2 text-sm font-medium transition-colors">
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}