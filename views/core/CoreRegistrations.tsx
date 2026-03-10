'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Upload, Download, Users, CheckCircle, Clock, Settings, Trash2, AlertCircle } from 'lucide-react';

interface Reg {
  id: string;
  name: string;
  reg_no: string;
  email: string;
  qr_token: string;
  created_at: string;
  att_1_at: string | null;
  att_2_at: string | null;
  att_3_at: string | null;
}

interface Event {
  id: number;
  title: string;
  date: string;
  status: string;
  sessions_enabled: number;
  active_session: number;
}

export default function CoreRegistrations({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'list' | 'import'>('list');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const [clearing, setClearing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const [evRes, regRes] = await Promise.all([
      supabase.from('events').select('id, title, date, status, sessions_enabled, active_session').eq('id', eventId).single(),
      supabase.from('registrations').select('*').eq('event_id', eventId).order('reg_no'),
    ]);
    if (evRes.data) setEvent(evRes.data);
    if (regRes.data) setRegs(regRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [eventId]);

  const updateEvent = async (field: string, value: number) => {
    await supabase.from('events').update({ [field]: value }).eq('id', eventId);
    setEvent(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setImportResult(null);
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    const resolve = (row: Record<string, string>, keys: string[]): string => {
      for (const k of keys) {
        const found = Object.keys(row).find(r => r.toLowerCase().replace(/[^a-z0-9]/g, '') === k);
        if (found && row[found]) return String(row[found]).trim();
      }
      return '';
    };
    let added = 0; let skipped = 0; const errors: string[] = [];
    for (const row of rows) {
      const name  = resolve(row, ['name', 'fullname', 'studentname']);
      const regno = resolve(row, ['id', 'regno', 'regid', 'registerno', 'registrationnumber', 'rollno', 'rollnumber']);
      const email = resolve(row, ['email', 'emailid', 'mail']);
      if (!name || !regno || !email) { errors.push('Skipped row (missing fields): ' + JSON.stringify(row)); skipped++; continue; }
      const { error } = await supabase.from('registrations').insert({
        event_id: parseInt(eventId), name, reg_no: regno.toUpperCase(), email: email.toLowerCase(),
      });
      if (error) { if (error.code === '23505') { skipped++; } else { errors.push(regno + ': ' + error.message); skipped++; } }
      else { added++; }
    }
    setImportResult({ added, skipped, errors: errors.slice(0, 5) });
    setImporting(false); e.target.value = '';
    fetchData();
  };

  const exportCSV = () => {
    if (!event) return;
    const sessions = event.sessions_enabled;
    const s1 = sessions >= 1; const s2 = sessions >= 2; const s3 = sessions >= 3;
    const headers = ['Reg No', 'Name', 'Email',
      ...(s1 ? ['Session 1', 'Session 1 Time'] : []),
      ...(s2 ? ['Session 2', 'Session 2 Time'] : []),
      ...(s3 ? ['Session 3', 'Session 3 Time'] : []),
    ];
    const csvRows = regs.map(r => [
      r.reg_no, r.name, r.email,
      ...(s1 ? [r.att_1_at ? 'Present' : 'Absent', r.att_1_at ? new Date(r.att_1_at).toLocaleString() : ''] : []),
      ...(s2 ? [r.att_2_at ? 'Present' : 'Absent', r.att_2_at ? new Date(r.att_2_at).toLocaleString() : ''] : []),
      ...(s3 ? [r.att_3_at ? 'Present' : 'Absent', r.att_3_at ? new Date(r.att_3_at).toLocaleString() : ''] : []),
    ]);
    const q = (v: string) => '"' + v.replace(/"/g, '""') + '"';
    const csv = [headers, ...csvRows].map(r => r.map(c => q(String(c))).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = event.title.replace(/\s+/g, '_') + '_attendance.csv'; a.click();
  };

  const clearRegistrations = async () => {
    if (!confirm('Delete ALL registrations for this event? This cannot be undone.')) return;
    setClearing(true);
    await supabase.from('registrations').delete().eq('event_id', eventId);
    setClearing(false); fetchData();
  };

  const AttBadge = ({ val }: { val: string | null }) =>
    val ? (
      <span title={new Date(val).toLocaleString()} className="flex items-center gap-1 text-green-400 text-xs font-medium">
        <CheckCircle size={11} /> Present
      </span>
    ) : (
      <span className="flex items-center gap-1 text-[#484f58] text-xs">
        <Clock size={11} /> Absent
      </span>
    );

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#30363d] border-t-[#7d8590] rounded-full animate-spin" />
    </div>
  );

  const sessions = event?.sessions_enabled ?? 1;
  const checkedIn = [
    regs.filter(r => r.att_1_at).length,
    regs.filter(r => r.att_2_at).length,
    regs.filter(r => r.att_3_at).length,
  ];

  return (
    <div>
      <button onClick={() => router.back()} className="mb-5 flex items-center gap-2 text-[#7d8590] hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Back
      </button>
      {event && (
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">{event.title}</h1>
          <p className="text-[#7d8590] text-sm mt-0.5">{event.date}</p>
        </div>
      )}
      {event && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 mb-6">
          <p className="text-[#7d8590] text-xs font-medium uppercase tracking-widest mb-4 flex items-center gap-2">
            <Settings size={12} /> Session Settings
          </p>
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-[#7d8590] text-xs mb-2">Sessions enabled</p>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => updateEvent('sessions_enabled', n)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${event.sessions_enabled >= n ? 'bg-blue-600 text-white' : 'bg-[#21262d] text-[#484f58] hover:text-[#7d8590]'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#7d8590] text-xs mb-2">Active session</p>
              <div className="flex gap-2">
                {Array.from({ length: event.sessions_enabled }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => updateEvent('active_session', n)}
                    className={`px-3 h-9 rounded-lg text-sm font-bold transition-colors ${event.active_session === n ? 'bg-green-600 text-white' : 'bg-[#21262d] text-[#7d8590] hover:bg-[#30363d]'}`}>
                    S{n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#161b22] rounded-lg p-4">
          <p className="text-[#7d8590] text-xs mb-1">Registered</p>
          <p className="text-xl font-bold text-white flex items-center gap-2"><Users size={15} className="text-blue-400" />{regs.length}</p>
        </div>
        {[1,2,3].slice(0, sessions).map(n => (
          <div key={n} className="bg-[#161b22] rounded-lg p-4">
            <p className="text-[#7d8590] text-xs mb-1">Session {n} present</p>
            <p className="text-xl font-bold text-green-400">{checkedIn[n-1]}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-1 mb-5 bg-[#161b22] rounded-lg p-1 w-fit">
        {(['list', 'import'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-[#21262d] text-white' : 'text-[#7d8590] hover:text-white'}`}>
            {t === 'list' ? 'Registrations' : 'Import'}
          </button>
        ))}
      </div>
      {tab === 'import' && (
        <div className="space-y-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h3 className="text-white font-semibold mb-1">Import from Excel / CSV / GSheet</h3>
            <p className="text-[#7d8590] text-sm mb-4">
              Required columns (flexible naming):
              {' '}<code className="text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded text-xs">name</code>{' '}
              <code className="text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded text-xs">reg_no / regno</code>{' '}
              <code className="text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded text-xs">email</code>.
              {' '}For Google Sheets: File → Download → CSV.
            </p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileImport} className="hidden" />
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => fileRef.current?.click()} disabled={importing}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors">
                <Upload size={15} />
                {importing ? 'Importing...' : 'Choose File (.xlsx / .csv)'}
              </button>
              {regs.length > 0 && (
                <button onClick={clearRegistrations} disabled={clearing}
                  className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg text-sm transition-colors">
                  <Trash2 size={14} /> {clearing ? 'Clearing...' : 'Clear all'}
                </button>
              )}
            </div>
          </div>
          {importResult && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-1">
              <p className="text-green-400 font-semibold">&#10003; {importResult.added} added</p>
              {importResult.skipped > 0 && <p className="text-yellow-400 text-sm">{importResult.skipped} skipped (duplicates or missing fields)</p>}
              {importResult.errors.map((e, i) => <p key={i} className="text-red-400 text-xs font-mono">{e}</p>)}
            </div>
          )}
        </div>
      )}
      {tab === 'list' && (
        <div>
          <div className="flex justify-end mb-3">
            <button onClick={exportCSV} disabled={regs.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#7d8590] hover:text-white rounded-lg text-sm transition-colors disabled:opacity-40">
              <Download size={14} /> Export CSV
            </button>
          </div>
          {regs.length === 0 ? (
            <div className="text-center text-[#7d8590] py-16 flex flex-col items-center gap-3">
              <AlertCircle size={32} className="text-[#30363d]" />
              <p>No registrations yet.</p>
              <button onClick={() => setTab('import')} className="text-blue-400 hover:text-blue-300 text-sm underline">
                Import from Excel / CSV →
              </button>
            </div>
          ) : (
            <div className="bg-[#161b22] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#21262d]">
                      <th className="text-left px-4 py-3 text-[#7d8590] font-medium">Reg No.</th>
                      <th className="text-left px-4 py-3 text-[#7d8590] font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-[#7d8590] font-medium hidden sm:table-cell">Email</th>
                      {sessions >= 1 && <th className="text-left px-4 py-3 text-[#7d8590] font-medium">S1</th>}
                      {sessions >= 2 && <th className="text-left px-4 py-3 text-[#7d8590] font-medium">S2</th>}
                      {sessions >= 3 && <th className="text-left px-4 py-3 text-[#7d8590] font-medium">S3</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {regs.map(reg => (
                      <tr key={reg.id} className="border-b border-[#21262d] last:border-0 hover:bg-[#21262d]/50 transition-colors">
                        <td className="px-4 py-3 text-white font-mono text-xs">{reg.reg_no}</td>
                        <td className="px-4 py-3 text-white">{reg.name}</td>
                        <td className="px-4 py-3 text-[#7d8590] text-xs hidden sm:table-cell">{reg.email}</td>
                        {sessions >= 1 && <td className="px-4 py-3"><AttBadge val={reg.att_1_at} /></td>}
                        {sessions >= 2 && <td className="px-4 py-3"><AttBadge val={reg.att_2_at} /></td>}
                        {sessions >= 3 && <td className="px-4 py-3"><AttBadge val={reg.att_3_at} /></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}