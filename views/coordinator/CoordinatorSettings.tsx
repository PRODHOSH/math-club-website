'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, User, CheckCircle, AlertCircle } from 'lucide-react';

export default function CoordinatorSettings() {
  const [email, setEmail]           = useState('');
  const [name, setName]             = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg]       = useState<{ ok: boolean; text: string } | null>(null);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving]   = useState(false);
  const [pwdMsg, setPwdMsg]         = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? '');
        setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      }
    })();
  }, []);

  const saveName = async () => {
    setNameSaving(true); setNameMsg(null);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setNameMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Name updated.' });
    setNameSaving(false);
  };

  const savePwd = async () => {
    setPwdMsg(null);
    if (!currentPwd || !newPwd || !confirmPwd) { setPwdMsg({ ok: false, text: 'Fill in all fields.' }); return; }
    if (newPwd !== confirmPwd)  { setPwdMsg({ ok: false, text: 'Passwords do not match.' }); return; }
    if (newPwd.length < 6)     { setPwdMsg({ ok: false, text: 'Password must be at least 6 characters.' }); return; }
    setPwdSaving(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPwd });
    if (signInError) { setPwdMsg({ ok: false, text: 'Current password is incorrect.' }); setPwdSaving(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) {
      setPwdMsg({ ok: false, text: error.message });
    } else {
      setPwdMsg({ ok: true, text: 'Password changed successfully.' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    }
    setPwdSaving(false);
  };

  const inp = 'w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] transition-colors placeholder:text-[#7d8590]';

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-[#7d8590] text-sm mt-1">Manage your account details and password.</p>
      </div>

      {/* Account Details */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User size={15} className="text-[#7d8590]" />
          <h2 className="text-sm font-semibold text-white">Account Details</h2>
        </div>
        <div>
          <label className="block text-xs text-[#7d8590] mb-1.5">Email</label>
          <input value={email} readOnly className={inp + ' opacity-50 cursor-not-allowed'} />
        </div>
        <div>
          <label className="block text-xs text-[#7d8590] mb-1.5">Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className={inp} placeholder="Your name" suppressHydrationWarning />
        </div>
        {nameMsg && (
          <div className={`flex items-center gap-2 text-xs rounded-md px-3 py-2 ${nameMsg.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {nameMsg.ok ? <CheckCircle size={13} /> : <AlertCircle size={13} />} {nameMsg.text}
          </div>
        )}
        <button onClick={saveName} disabled={nameSaving} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-md hover:bg-white/90 disabled:opacity-50 transition-colors">
          {nameSaving ? 'Saving...' : 'Save Name'}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={15} className="text-[#7d8590]" />
          <h2 className="text-sm font-semibold text-white">Change Password</h2>
        </div>
        <div>
          <label className="block text-xs text-[#7d8590] mb-1.5">Current Password</label>
          <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className={inp} placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" suppressHydrationWarning />
        </div>
        <div>
          <label className="block text-xs text-[#7d8590] mb-1.5">New Password</label>
          <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className={inp} placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" suppressHydrationWarning />
        </div>
        <div>
          <label className="block text-xs text-[#7d8590] mb-1.5">Confirm New Password</label>
          <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className={inp} placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" suppressHydrationWarning />
        </div>
        {pwdMsg && (
          <div className={`flex items-center gap-2 text-xs rounded-md px-3 py-2 ${pwdMsg.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {pwdMsg.ok ? <CheckCircle size={13} /> : <AlertCircle size={13} />} {pwdMsg.text}
          </div>
        )}
        <button onClick={savePwd} disabled={pwdSaving} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-md hover:bg-white/90 disabled:opacity-50 transition-colors">
          {pwdSaving ? 'Updating...' : 'Change Password'}
        </button>
      </div>
    </div>
  );
}