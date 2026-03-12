'use client';
import React, { useEffect, useState } from 'react';
import { Search, Plus, Trash2, X, ShieldCheck, Shield, ChevronDown, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: 'admin' | 'coordinator';
  created_at: string;
}

const ROLES = ['admin', 'coordinator'] as const;
type Role = typeof ROLES[number];

function Avatar({ name, url }: { name: string; url: string }) {
  const [err, setErr] = useState(false);
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-600'];
  const color = colors[(initials.charCodeAt(0) || 0) % colors.length];
  if (url && !err) {
    return <img src={url} onError={() => setErr(true)} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />;
  }
  return <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>{initials}</div>;
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin') return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#30363d] text-[#7d8590] text-xs">
      <ShieldCheck size={12} className="text-[#7d8590]" /> USER
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#30363d] text-[#7d8590] text-xs">
      <Shield size={12} className="text-[#7d8590]" /> USER
    </span>
  );
}

function RoleDropdown({ profile, onSwitch }: { profile: Profile; onSwitch: (id: string, role: Role) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
          profile.role === 'admin'
            ? 'border-yellow-500/30 text-yellow-300 bg-yellow-500/10'
            : 'border-blue-500/30 text-blue-300 bg-blue-500/10'
        }`}
      >
        {profile.role === 'admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
        <span className="capitalize">{profile.role}</span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden w-40 shadow-xl">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => { onSwitch(profile.id, r); setOpen(false); }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs text-[#f0f6fc] hover:bg-[#21262d] transition-colors"
              >
                <span className="flex items-center gap-1.5 capitalize">
                  {r === 'admin' ? <ShieldCheck size={12} className="text-yellow-400" /> : <Shield size={12} className="text-blue-400" />}
                  {r}
                </span>
                {profile.role === r && <Check size={12} className="text-[#58a6ff]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminAccess() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('coordinator');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadErr, setLoadErr] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);

  const load = async () => {
    setLoadErr('');
    const { data, error: rpcErr } = await supabase.rpc('get_roles_with_emails');
    if (rpcErr) { setLoadErr(rpcErr.message); return; }
    setProfiles((data as Profile[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = (p.email?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q));
    const matchRole = roleFilter === 'all' || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  const grantAccess = async () => {
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
    await supabase.rpc('revoke_role_by_id', { p_id: id });
    setDeleteId(null); load();
  };

  const switchRole = async (id: string, newRole: Role) => {
    setSwitching(id);
    await supabase.rpc('grant_role_by_email', {
      p_email: profiles.find(p => p.id === id)?.email ?? '',
      p_role: newRole,
    });
    setSwitching(null); load();
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const inp = 'w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] transition-colors placeholder:text-[#7d8590]';

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src="/math-club-logo.jpeg" alt="Math Club" className="w-10 h-10 rounded-xl object-cover border border-yellow-500/20" />
          <div>
            <h1 className="text-xl font-semibold text-[#f0f6fc] leading-none">Access</h1>
            <p className="text-[#7d8590] text-xs mt-0.5">Manage admin and core team access</p>
          </div>
        </div>
        <button
          onClick={() => { setOpen(true); setEmail(''); setRole('coordinator'); setError(''); }}
          className="flex items-center gap-2 bg-white text-black text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} /> Grant Access
        </button>
      </div>

      {loadErr && (
        <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-4 py-3">
          <X size={13} /> {loadErr}
        </div>
      )}

      {/* Role info cards */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        <div className="flex items-start gap-3 bg-[#161b22] border border-yellow-500/15 rounded-xl px-4 py-3.5">
          <ShieldCheck size={16} className="text-yellow-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#f0f6fc]">Admin</p>
            <p className="text-xs text-[#7d8590] mt-0.5 leading-relaxed">Full access — manage all content, events, tutorials, council and team members.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-[#161b22] border border-blue-500/15 rounded-xl px-4 py-3.5">
          <Shield size={16} className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#f0f6fc]">Coordinator</p>
            <p className="text-xs text-[#7d8590] mt-0.5 leading-relaxed">Core team access — can scan QR codes and view registrations for events they coordinate.</p>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8590]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by email or name…"
            className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg pl-9 pr-4 py-2 text-sm text-[#f0f6fc] placeholder:text-[#7d8590] focus:outline-none focus:border-[#58a6ff] transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', ...ROLES] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium capitalize border transition-colors ${
                roleFilter === r ? 'bg-white text-black border-white' : 'border-[#21262d] text-[#7d8590] hover:text-[#f0f6fc] hover:border-[#30363d]'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d1117] border border-[#21262d] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_180px_160px_80px] text-[11px] font-semibold text-[#7d8590] uppercase tracking-widest px-5 py-3 border-b border-[#21262d]">
          <span>Identity</span>
          <span>Access Level</span>
          <span>Joined On</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-14 text-center text-[#7d8590] text-sm">No users found.</div>
        ) : (
          filtered.map((p, i) => (
            <div
              key={p.id}
              className={`grid grid-cols-[1fr_180px_160px_80px] items-center px-5 py-4 ${i !== filtered.length - 1 ? 'border-b border-[#21262d]' : ''} hover:bg-[#161b22] transition-colors`}
            >
              {/* Identity */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={p.name || p.email} url={p.avatar_url} />
                <div className="min-w-0">
                  {p.name && <p className="text-sm font-semibold text-[#f0f6fc] truncate uppercase tracking-wide">{p.name}</p>}
                  <p className="text-xs text-[#7d8590] flex items-center gap-1 truncate">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    {p.email}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className={switching === p.id ? 'opacity-50 pointer-events-none' : ''}>
                <RoleDropdown profile={p} onSwitch={switchRole} />
              </div>

              {/* Joined */}
              <div className="flex items-center gap-1.5 text-xs text-[#7d8590]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                {formatDate(p.created_at)}
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={() => setDeleteId(p.id)}
                  className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Grant Access modal */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-[#f0f6fc]">Grant Access</h2>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-[#21262d] flex items-center justify-center text-[#7d8590] hover:text-[#f0f6fc] transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs text-[#7d8590] mb-1.5">Email address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="user@example.com"
                  onKeyDown={e => e.key === 'Enter' && grantAccess()} />
                <p className="text-[11px] text-[#7d8590] mt-1.5">The user must already have an account on the site.</p>
              </div>

              <div>
                <label className="block text-xs text-[#7d8590] mb-2">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm border transition-all ${
                        role === r
                          ? r === 'admin'
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                          : 'border-[#30363d] text-[#7d8590] hover:border-[#7d8590] hover:text-[#f0f6fc]'
                      }`}>
                      {r === 'admin' ? <ShieldCheck size={15} /> : <Shield size={15} />}
                      <span className="capitalize font-medium">{r}</span>
                      {role === r && <Check size={13} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-3 py-2.5">
                  <X size={12} /> {error}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setOpen(false)}
                className="flex-1 border border-[#30363d] rounded-lg py-2.5 text-sm text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors">
                Cancel
              </button>
              <button onClick={grantAccess} disabled={saving}
                className="flex-1 bg-white text-black rounded-lg py-2.5 text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : 'Grant Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-[#f0f6fc] mb-2">Revoke Access?</h2>
            <p className="text-[#7d8590] text-sm mb-6 leading-relaxed">This will remove their admin or coordinator role. They can still log in but won't have elevated access.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-[#30363d] rounded-lg py-2.5 text-sm text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors">
                Cancel
              </button>
              <button onClick={() => removeAccess(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-500 rounded-lg py-2.5 text-sm font-semibold transition-colors">
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}