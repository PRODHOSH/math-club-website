'use client';
import React, { useEffect, useState } from 'react';
import { Search, Plus, Trash2, X, ShieldCheck, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'coordinator' | null;
}

const ROLES = ['admin', 'coordinator'] as const;
type Role = typeof ROLES[number];

const roleBadge = (role: string | null) => {
  if (role === 'admin')       return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/25';
  if (role === 'coordinator') return 'bg-blue-500/10  text-blue-300  border-blue-500/25';
  return 'bg-white/5 text-[#7d8590] border-[#30363d]';
};

export default function AdminAccess() {
  const [profiles, setProfiles]   = useState<Profile[]>([]);
  const [filtered, setFiltered]   = useState<Profile[]>([]);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [open, setOpen]           = useState(false);
  const [email, setEmail]         = useState('');
  const [role, setRole]           = useState<Role>('coordinator');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [loadErr, setLoadErr]     = useState('');
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const load = async () => {
    setLoadErr('');
    const { data, error: rpcErr } = await supabase.rpc('get_roles_with_emails');
    if (rpcErr) { setLoadErr(rpcErr.message); return; }
    setProfiles((data as Profile[]) ?? []);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(profiles.filter(p =>
      (p.email?.toLowerCase().includes(q) || p.role?.includes(q)) &&
      (roleFilter === 'all' || p.role === roleFilter)
    ));
  }, [profiles, search, roleFilter]);

  const addAccess = async () => {
    if (!email.trim()) { setError('Email is required.'); return; }
    setSaving(true); setError('');

    const { data, error: rpcErr } = await supabase.rpc('grant_role_by_email', {
      p_email: email.trim().toLowerCase(),
      p_role: role,
    });

    if (rpcErr || data?.success === false) {
      setError(data?.error ?? rpcErr?.message ?? 'Failed to grant access.');
      setSaving(false); return;
    }

    setSaving(false); setOpen(false); setEmail(''); load();
  };

  const removeAccess = async (id: string) => {
    const { data, error: rpcErr } = await supabase.rpc('revoke_role_by_id', { p_id: id });
    if (rpcErr || data?.success === false) {
      setError(data?.error ?? rpcErr?.message ?? 'Failed to revoke access.');
    }
    setDeleteId(null); load();
  };

  const inp = 'w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] transition-colors placeholder:text-[#7d8590]';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#f0f6fc]">Access</h1>
          <p className="text-[#7d8590] text-sm mt-0.5">Manage admin and core team access</p>
        </div>
        <button
          onClick={() => { setOpen(true); setEmail(''); setRole('coordinator'); setError(''); }}
          className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-md hover:bg-white/90 transition-colors"
        >
          <Plus size={15} /> Grant Access
        </button>
      </div>

      {/* Load error */}
      {loadErr && (
        <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-md px-4 py-3">
          <X size={14} className="shrink-0" /> {loadErr}
        </div>
      )}

      {/* Role explainer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="flex items-start gap-3 bg-[#161b22] border border-[#21262d] rounded-md px-4 py-3">
          <ShieldCheck size={16} className="text-yellow-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#f0f6fc]">Admin</p>
            <p className="text-xs text-[#7d8590] mt-0.5">Full access — manage all content, events, tutorials, council and team members.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-[#161b22] border border-[#21262d] rounded-md px-4 py-3">
          <Shield size={16} className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#f0f6fc]">Coordinator</p>
            <p className="text-xs text-[#7d8590] mt-0.5">Core team access — can scan QR codes and view registrations for events they coordinate.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8590]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email…"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-4 py-2 text-sm text-[#f0f6fc] placeholder:text-[#7d8590] focus:outline-none focus:border-[#58a6ff] transition-colors" />
        </div>
        <div className="flex gap-2">
          {(['all', ...ROLES] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md text-xs border capitalize transition-colors ${roleFilter === r ? 'bg-white text-black border-white' : 'border-[#30363d] text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d]'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#21262d] text-[#7d8590] text-xs uppercase tracking-wider bg-[#161b22]">
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Role</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-[#21262d] bg-[#161b22] hover:bg-[#21262d] transition-colors">
                <td className="px-5 py-3 text-[#f0f6fc] font-mono text-sm">{p.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${roleBadge(p.role)}`}>{p.role}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => setDeleteId(p.id)}
                    className="p-1.5 text-[#7d8590] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-10 text-center text-[#7d8590]">No users with access found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grant access modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[#f0f6fc]">Grant Access</h2>
              <button onClick={() => setOpen(false)} className="text-[#7d8590] hover:text-[#f0f6fc] transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#7d8590] mb-1.5">Email address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="user@example.com" />
                <p className="text-[11px] text-[#7d8590] mt-1">The user must already have an account on the site.</p>
              </div>
              <div>
                <label className="block text-xs text-[#7d8590] mb-2">Role</label>
                <div className="flex gap-2">
                  {ROLES.map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 rounded-md text-sm capitalize border transition-colors ${role === r ? 'bg-white text-black border-white font-medium' : 'border-[#30363d] text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d]'}`}>
                      {r === 'admin' ? 'Admin' : 'Coordinator'}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setOpen(false)}
                className="flex-1 border border-[#30363d] rounded-md py-2.5 text-sm text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors">
                Cancel
              </button>
              <button onClick={addAccess} disabled={saving}
                className="flex-1 bg-white text-black rounded-md py-2.5 text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : 'Grant Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 max-w-sm w-full">
            <h2 className="font-semibold text-[#f0f6fc] mb-2">Revoke Access?</h2>
            <p className="text-[#7d8590] text-sm mb-5">This will remove their admin or core role. They can still log in but won't have elevated access.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-[#30363d] rounded-md py-2 text-sm text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors">
                Cancel
              </button>
              <button onClick={() => removeAccess(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-500 rounded-md py-2 text-sm font-medium transition-colors">
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
