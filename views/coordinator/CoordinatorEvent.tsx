'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft, QrCode, Camera, CheckCircle, XCircle, AlertCircle, Loader2,
  Database, Zap, Users, Plus, Trash2, Download, X,
} from 'lucide-react';

interface Reg {
  id: string; name: string; reg_no: string; email: string; qr_token: string;
  att_1_at: string | null; att_2_at: string | null; att_3_at: string | null;
}
interface Event {
  id: number; title: string; date: string; status: string;
  sessions_enabled: number; active_session: number; db_mode: boolean;
}
interface ScanResult {
  type: 'success' | 'already' | 'rejected' | 'error' | 'created';
  name?: string; reg_no?: string; session?: number; message?: string;
}

const EMPTY_ROW = { name: '', reg_no: '', email: '' };

export default function CoordinatorEvent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [event, setEvent]   = useState<Event | null>(null);
  const [regs, setRegs]     = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);

  // Scan
  const scannerDivRef  = useRef<HTMLDivElement>(null);
  const html5QrRef     = useRef<any>(null);
  const [scanning, setScanning]       = useState(false);
  const [processing, setProcessing]   = useState(false);
  const [scanResult, setScanResult]   = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [activeSession, setActiveSession] = useState(1);
  const [dbMode, setDbMode]           = useState(true);

  // DB modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm]         = useState(EMPTY_ROW);
  const [addSaving, setAddSaving]     = useState(false);
  const [addError, setAddError]       = useState('');
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // Walk-in modal (Free Scan — unknown QR)
  const [walkinToken, setWalkinToken]   = useState<string | null>(null);
  const [walkinAttCol, setWalkinAttCol] = useState<'att_1_at' | 'att_2_at' | 'att_3_at'>('att_1_at');
  const [walkinForm, setWalkinForm]     = useState({ name: '', reg_no: '', email: '' });
  const [walkinSaving, setWalkinSaving] = useState(false);
  const [walkinError, setWalkinError]   = useState('');

  const fetchData = useCallback(async () => {
    const [evRes, regRes] = await Promise.all([
      supabase.from('events')
        .select('id, title, date, status, sessions_enabled, active_session, db_mode')
        .eq('id', eventId).single(),
      supabase.from('registrations').select('*').eq('event_id', eventId).order('reg_no'),
    ]);
    if (evRes.data) {
      setEvent(evRes.data);
      setActiveSession(evRes.data.active_session ?? 1);
      setDbMode(evRes.data.db_mode ?? true);
    }
    if (regRes.data) setRegs(regRes.data);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Scanner ── */
  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
      try { html5QrRef.current.clear(); } catch {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };
  useEffect(() => () => { stopScanner(); }, []);

  const processQr = async (rawText: string) => {
    setProcessing(true);
    let parsed: Record<string, string> = {};
    try { parsed = JSON.parse(rawText); } catch {}
    const token   = parsed.token   || rawText;
    const qrName  = parsed.name    || '';
    const qrRegNo = parsed.reg_no  || '';
    const qrEmail = parsed.email   || '';
    const attCol  = `att_${activeSession}_at` as 'att_1_at' | 'att_2_at' | 'att_3_at';

    const { data: reg } = await supabase
      .from('registrations')
      .select('id, name, reg_no, event_id, att_1_at, att_2_at, att_3_at')
      .eq('qr_token', token)
      .maybeSingle();

    if (dbMode) {
      if (!reg || String(reg.event_id) !== String(eventId)) {
        setScanResult({ type: 'rejected', message: 'Not in the registration list for this event.' });
        setProcessing(false); return;
      }
      if (reg[attCol]) {
        setScanResult({ type: 'already', name: reg.name, reg_no: reg.reg_no, session: activeSession,
          message: `Marked at ${new Date(reg[attCol] as string).toLocaleTimeString()}` });
        setProcessing(false); return;
      }
      await supabase.from('registrations').update({ [attCol]: new Date().toISOString() }).eq('id', reg.id);
      setScanResult({ type: 'success', name: reg.name, reg_no: reg.reg_no, session: activeSession });
      fetchData();
    } else {
      if (reg && String(reg.event_id) === String(eventId)) {
        if (reg[attCol]) {
          setScanResult({ type: 'already', name: reg.name, reg_no: reg.reg_no, session: activeSession,
            message: `Marked at ${new Date(reg[attCol] as string).toLocaleTimeString()}` });
          setProcessing(false); return;
        }
        await supabase.from('registrations').update({ [attCol]: new Date().toISOString() }).eq('id', reg.id);
        setScanResult({ type: 'success', name: reg.name, reg_no: reg.reg_no, session: activeSession });
      } else {
        // Unknown QR — if it has embedded data, auto-create immediately
        if (qrName && qrRegNo) {
          const { data: newReg, error } = await supabase
            .from('registrations')
            .insert({
              event_id: parseInt(eventId),
              name: qrName,
              reg_no: qrRegNo.toUpperCase(),
              email: qrEmail,
              qr_token: token,
              [attCol]: new Date().toISOString(),
            })
            .select('name, reg_no').single();
          if (error) {
            setScanResult({ type: 'error', message: error.message });
          } else {
            setScanResult({ type: 'created', name: newReg.name, reg_no: newReg.reg_no, session: activeSession,
              message: 'Entry created and attendance marked.' });
          }
        } else {
          // Plain token with no embedded data — ask coordinator to fill details
          setWalkinToken(token);
          setWalkinAttCol(attCol);
          setWalkinForm({ name: '', reg_no: '', email: '' });
          setWalkinError('');
        }
      }
      fetchData();
    }
    setProcessing(false);
  };

  const saveWalkin = async () => {
    if (!walkinToken) return;
    if (!walkinForm.name.trim() || !walkinForm.reg_no.trim() || !walkinForm.email.trim()) {
      setWalkinError('All fields are required.'); return;
    }
    setWalkinSaving(true); setWalkinError('');
    const { data: newReg, error } = await supabase
      .from('registrations')
      .insert({
        event_id: parseInt(eventId),
        name: walkinForm.name.trim(),
        reg_no: walkinForm.reg_no.trim().toUpperCase(),
        email: walkinForm.email.trim().toLowerCase(),
        qr_token: walkinToken,
        [walkinAttCol]: new Date().toISOString(),
      })
      .select('name, reg_no').single();
    if (error) {
      setWalkinError(error.code === '23505' ? 'Reg No or Email already exists for this event.' : error.message);
    } else {
      const sessionNum = parseInt(walkinAttCol.replace('att_', '').replace('_at', ''));
      setScanResult({ type: 'created', name: newReg.name, reg_no: newReg.reg_no, session: sessionNum,
        message: 'Entry created and attendance marked.' });
      setWalkinToken(null);
      fetchData();
    }
    setWalkinSaving(false);
  };

  const startScanner = async () => {
    if (!scannerDivRef.current) return;
    setCameraError(''); setScanResult(null); setScanning(true);
    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('coord-qr-reader');
    html5QrRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText: string) => { await stopScanner(); await processQr(decodedText); },
        () => {}
      );
    } catch {
      setScanning(false);
      setCameraError('Could not access camera. Grant camera permission and try again.');
    }
  };

  const toggleDbMode = async (val: boolean) => {
    setDbMode(val);
    await supabase.from('events').update({ db_mode: val }).eq('id', eventId);
  };

  const updateActiveSession = async (s: number) => {
    setActiveSession(s);
    await supabase.from('events').update({ active_session: s }).eq('id', eventId);
    setEvent(prev => prev ? { ...prev, active_session: s } : prev);
  };

  const updateSessionsEnabled = async (n: number) => {
    await supabase.from('events').update({ sessions_enabled: n }).eq('id', eventId);
    setEvent(prev => prev ? { ...prev, sessions_enabled: n } : prev);
  };

  /* ── DB ops ── */
  const addRow = async () => {
    if (!addForm.name.trim() || !addForm.reg_no.trim() || !addForm.email.trim()) {
      setAddError('All fields are required.'); return;
    }
    setAddSaving(true); setAddError('');
    const { error } = await supabase.from('registrations').insert({
      event_id: parseInt(eventId),
      name: addForm.name.trim(),
      reg_no: addForm.reg_no.trim().toUpperCase(),
      email: addForm.email.trim().toLowerCase(),
    });
    if (error) setAddError(error.code === '23505' ? 'Already exists.' : error.message);
    else { setShowAddModal(false); setAddForm(EMPTY_ROW); fetchData(); }
    setAddSaving(false);
  };

  const deleteRow = async (id: string) => {
    setDeleteError('');
    const { data: deleted, error } = await supabase
      .from('registrations').delete().eq('id', id).select();
    if (error) { setDeleteError(error.message); return; }
    if (!deleted || deleted.length === 0) {
      setDeleteError('Delete failed — check database permissions (RLS policy).');
      return;
    }
    setDeleteId(null); fetchData();
  };

  const exportCSV = () => {
    if (!event) return;
    const s = event.sessions_enabled;
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
    a.download = (event.title.replace(/\s+/g, '_') || 'attendance') + '.csv'; a.click();
  };

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#30363d] border-t-[#7d8590] rounded-full animate-spin" />
    </div>
  );

  const sessions   = event?.sessions_enabled ?? 1;
  const checkedIn  = [
    regs.filter(r => r.att_1_at).length,
    regs.filter(r => r.att_2_at).length,
    regs.filter(r => r.att_3_at).length,
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <button onClick={() => router.push('/coordinator')} className="mb-4 flex items-center gap-2 text-[#7d8590] hover:text-white transition-colors text-sm">
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
        {event && (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">{event.title}</h1>
              <p className="text-[#7d8590] text-sm mt-0.5">{event.date}</p>
            </div>
            <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
              event.status === 'current' ? 'bg-green-500/10 text-green-400' : 'bg-[#21262d] text-[#7d8590]'
            }`}>
              {event.status === 'current' ? 'Live' : event.status}
            </span>
          </div>
        )}
      </div>

      {/* ─── SCAN SECTION ─── */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <QrCode size={16} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Scan Attendance</h2>
          </div>
          {/* DB / Free Scan toggle */}
          <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5">
            <button
              onClick={() => toggleDbMode(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                dbMode ? 'bg-blue-600 text-white' : 'text-[#7d8590] hover:text-white'
              }`}
            >
              <Database size={11} /> DB Mode
            </button>
            <button
              onClick={() => toggleDbMode(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                !dbMode ? 'bg-orange-600 text-white' : 'text-[#7d8590] hover:text-white'
              }`}
            >
              <Zap size={11} /> Free Scan
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Session selector */}
          <div>
            <p className="text-xs text-[#7d8590] mb-2 uppercase tracking-wider">Active Session</p>
            <div className="flex gap-2">
              {Array.from({ length: sessions }, (_, i) => i + 1).map(s => (
                <button
                  key={s}
                  onClick={() => updateActiveSession(s)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                    activeSession === s
                      ? 'bg-white text-black border-white'
                      : 'border-[#30363d] text-[#7d8590] hover:text-white hover:bg-[#21262d]'
                  }`}
                >
                  S{s}
                </button>
              ))}
            </div>
            {!dbMode && (
              <p className="text-orange-400/70 text-xs mt-2 bg-orange-500/5 border border-orange-500/15 rounded-md px-3 py-1.5">
                Free Scan: unregistered QRs will be auto-logged as new entries.
              </p>
            )}
          </div>

          {/* Camera */}
          <div className={`rounded-xl overflow-hidden bg-[#010409] ${scanning ? 'block' : 'hidden'}`}>
            <div id="coord-qr-reader" ref={scannerDivRef} className="w-full" />
          </div>

          {/* Idle */}
          {!scanning && !scanResult && !processing && (
            <div className="flex flex-col items-center py-4 gap-2">
              <div className="w-16 h-16 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center">
                <QrCode size={30} className="text-[#30363d]" />
              </div>
              {cameraError && (
                <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{cameraError}</p>
              )}
            </div>
          )}

          {/* Processing */}
          {processing && (
            <div className="flex items-center justify-center gap-3 py-6">
              <Loader2 size={24} className="animate-spin text-blue-400" />
              <span className="text-white font-medium text-sm">Checking...</span>
            </div>
          )}

          {/* Result */}
          {scanResult && !processing && (
            <div className={`rounded-xl p-4 border ${
              scanResult.type === 'success' || scanResult.type === 'created' ? 'bg-green-950/40 border-green-500/30' :
              scanResult.type === 'already' ? 'bg-yellow-950/40 border-yellow-500/30' :
              'bg-red-950/40 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2.5 mb-2">
                {(scanResult.type === 'success' || scanResult.type === 'created') && <CheckCircle size={20} className="text-green-400 shrink-0" />}
                {scanResult.type === 'already'  && <AlertCircle size={20} className="text-yellow-400 shrink-0" />}
                {(scanResult.type === 'rejected' || scanResult.type === 'error') && <XCircle size={20} className="text-red-400 shrink-0" />}
                <p className={`font-semibold text-sm ${
                  scanResult.type === 'success' || scanResult.type === 'created' ? 'text-green-400' :
                  scanResult.type === 'already' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {scanResult.type === 'success'  && `Checked In — Session ${scanResult.session}`}
                  {scanResult.type === 'created'  && `Auto-logged — Session ${scanResult.session}`}
                  {scanResult.type === 'already'  && `Already Marked — Session ${scanResult.session}`}
                  {scanResult.type === 'rejected' && 'Not Registered'}
                  {scanResult.type === 'error'    && 'Error'}
                </p>
              </div>
              {(scanResult.name || scanResult.reg_no) && (
                <div className="bg-black/20 rounded-lg px-3 py-2 space-y-0.5">
                  {scanResult.name   && <p className="text-white text-sm font-medium">{scanResult.name}</p>}
                  {scanResult.reg_no && <p className="text-[#7d8590] font-mono text-xs">{scanResult.reg_no}</p>}
                </div>
              )}
              {scanResult.message && <p className="text-[#7d8590] text-xs mt-1.5">{scanResult.message}</p>}
            </div>
          )}

          {/* Scan button */}
          {!processing && (
            <button
              onClick={scanResult ? () => { setScanResult(null); startScanner(); } : startScanner}
              disabled={scanning}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-40 ${
                scanResult ? 'bg-[#21262d] hover:bg-[#30363d] text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Camera size={15} />
              {scanResult ? 'Scan Next' : 'Open Camera'}
            </button>
          )}
        </div>
      </div>

      {/* ─── DATABASE SECTION ─── */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Registration Database</h2>
            <span className="text-[#7d8590] text-xs ml-1">({regs.length})</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Sessions count setter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#7d8590] text-xs">Sessions:</span>
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => updateSessionsEnabled(n)}
                  className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                    sessions === n ? 'bg-white text-black' : 'bg-[#21262d] text-[#7d8590] hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
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
              <Download size={12} /> Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={`grid divide-x divide-[#21262d] border-b border-[#21262d]`} style={{ gridTemplateColumns: `repeat(${1 + sessions}, 1fr)` }}>
          <StatCell label="Total" value={regs.length} />
          {sessions >= 1 && <StatCell label="S1 Present" value={checkedIn[0]} total={regs.length} green />}
          {sessions >= 2 && <StatCell label="S2 Present" value={checkedIn[1]} total={regs.length} green />}
          {sessions >= 3 && <StatCell label="S3 Present" value={checkedIn[2]} total={regs.length} green />}
        </div>

        {/* Table */}
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
                <tr>
                  <td colSpan={4 + sessions} className="text-center py-10 text-[#484f58] text-sm">
                    No registrations yet. The admin can import the database.
                  </td>
                </tr>
              ) : regs.map(r => (
                <tr key={r.id} className="border-b border-[#21262d]/60 hover:bg-[#0d1117]/40 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-[#7d8590]">{r.reg_no}</td>
                  <td className="px-4 py-2.5 text-[#f0f6fc] text-xs font-medium">{r.name}</td>
                  <td className="px-4 py-2.5 text-[#7d8590] text-xs">{r.email}</td>
                  {sessions >= 1 && <td className="px-3 py-2.5 text-center">{r.att_1_at ? <span title={new Date(r.att_1_at).toLocaleString()}><CheckCircle size={13} className="text-green-400 mx-auto" /></span> : <span className="text-[#30363d] text-xs">—</span>}</td>}
                  {sessions >= 2 && <td className="px-3 py-2.5 text-center">{r.att_2_at ? <span title={new Date(r.att_2_at).toLocaleString()}><CheckCircle size={13} className="text-green-400 mx-auto" /></span> : <span className="text-[#30363d] text-xs">—</span>}</td>}
                  {sessions >= 3 && <td className="px-3 py-2.5 text-center">{r.att_3_at ? <span title={new Date(r.att_3_at).toLocaleString()}><CheckCircle size={13} className="text-green-400 mx-auto" /></span> : <span className="text-[#30363d] text-xs">—</span>}</td>}
                  <td className="px-2 py-2.5">
                    <button onClick={() => { setDeleteId(r.id); setDeleteError(''); }} className="p-1 text-[#484f58] hover:text-red-400 transition-colors rounded">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ROW MODAL */}
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

      {/* DELETE ROW MODAL */}
      {deleteId && (
        <ModalOverlay onClose={() => { setDeleteId(null); setDeleteError(''); }}>
          <h2 className="text-white font-semibold mb-2">Remove Registration?</h2>
          <p className="text-[#7d8590] text-sm mb-4">This will permanently delete this person's record and attendance data.</p>
          {deleteError && <p className="text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{deleteError}</p>}
          <div className="flex gap-3">
            <button onClick={() => { setDeleteId(null); setDeleteError(''); }} className="flex-1 border border-[#30363d] rounded-md py-2 text-sm text-[#7d8590] hover:text-white hover:bg-[#21262d] transition-colors">Cancel</button>
            <button onClick={() => deleteRow(deleteId)} className="flex-1 bg-red-600 hover:bg-red-500 rounded-md py-2 text-sm font-medium transition-colors">Delete</button>
          </div>
        </ModalOverlay>
      )}

      {/* WALK-IN MODAL — shown when Free Scan hits an unknown QR */}
      {walkinToken && (
        <ModalOverlay onClose={() => { setWalkinToken(null); setWalkinError(''); }}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-white font-semibold">New Entry</h2>
            <button onClick={() => { setWalkinToken(null); setWalkinError(''); }} className="text-[#7d8590] hover:text-white"><X size={16} /></button>
          </div>
          <p className="text-[#7d8590] text-xs mb-4">
            QR not in database. Enter this person's details to create their registration and mark attendance.
          </p>
          <div className="space-y-3">
            {([
              { key: 'name',   label: 'Full Name',        placeholder: 'e.g. John Doe' },
              { key: 'reg_no', label: 'Registration No',  placeholder: 'e.g. 22BCE1234' },
              { key: 'email',  label: 'Email',            placeholder: 'e.g. john@example.com' },
            ] as const).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-[#7d8590] mb-1.5">{label}</label>
                <input
                  value={walkinForm[key]}
                  onChange={e => setWalkinForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] transition-colors placeholder:text-[#484f58]"
                  suppressHydrationWarning
                />
              </div>
            ))}
            {walkinError && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{walkinError}</p>}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setWalkinToken(null); setWalkinError(''); }}
              className="flex-1 border border-[#30363d] rounded-md py-2 text-sm text-[#7d8590] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveWalkin}
              disabled={walkinSaving}
              className="flex-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded-md py-2 text-sm font-medium text-white transition-colors"
            >
              {walkinSaving ? 'Saving...' : 'Mark Attendance'}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function StatCell({ label, value, total, green }: { label: string; value: number; total?: number; green?: boolean }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[#7d8590] text-xs mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${green && value > 0 ? 'text-green-400' : 'text-white'}`}>{value}</p>
      {total !== undefined && <p className="text-[#484f58] text-[10px]">{total > 0 ? Math.round(value / total * 100) : 0}%</p>}
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