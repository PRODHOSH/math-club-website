'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Mail, Shield, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminSettings() {
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [role, setRole] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string>('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser({ email: user.email ?? '', id: user.id });
      setCreatedAt(user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '');
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setRole(profile?.role ?? 'admin');
    })();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (newPassword.length < 8) {
      setMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      setMsg({ type: 'error', text: error.message });
    } else {
      setMsg({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <img src="/math-club-logo.jpeg" alt="Math Club" className="w-10 h-10 rounded-xl object-cover border border-yellow-500/20" />
        <div>
          <h1 className="text-xl font-semibold text-[#f0f6fc] leading-none">Settings</h1>
          <p className="text-[#7d8590] text-xs mt-0.5">Account & Security</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-widest mb-3">Account</p>
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl divide-y divide-[#21262d]">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Mail size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-[#7d8590]">Email address</p>
              <p className="text-sm text-[#f0f6fc] font-medium">{user?.email ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Shield size={16} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-[#7d8590]">Role</p>
              <p className="text-sm text-[#f0f6fc] font-medium capitalize">{role || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <User size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-[#7d8590]">Account created</p>
              <p className="text-sm text-[#f0f6fc] font-medium">{createdAt || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div>
        <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-widest mb-3">Security</p>
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <KeyRound size={15} className="text-[#7d8590]" />
            <p className="text-sm font-medium text-[#f0f6fc]">Change Password</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs text-[#7d8590] mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-[#f0f6fc] placeholder-[#7d8590] focus:outline-none focus:border-[#58a6ff] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-[#f0f6fc] transition-colors"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#7d8590] mb-1.5">Confirm new password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-[#f0f6fc] placeholder-[#7d8590] focus:outline-none focus:border-[#58a6ff] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-[#f0f6fc] transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {msg && (
              <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2.5 ${
                msg.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {msg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !newPassword || !confirmPassword}
              className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <KeyRound size={14} />
              )}
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
