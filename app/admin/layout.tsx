'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Calendar, Users, UserCircle2, LogOut, ShieldCheck, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navItems = [
  { label: 'Dashboard',  path: '/admin',            icon: LayoutDashboard },
  { label: 'Tutorials',  path: '/admin/tutorials',  icon: BookOpen },
  { label: 'Events',     path: '/admin/events',      icon: Calendar },
  { label: 'Council',    path: '/admin/council',     icon: UserCircle2 },
  { label: 'Team',       path: '/admin/team',        icon: Users },
  { label: 'Access',     path: '/admin/access',      icon: ShieldCheck },
  { label: 'Settings',   path: '/admin/settings',   icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Login page renders standalone — no auth check, no sidebar
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return; // skip auth check on login page
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/admin/login'); return; }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') {
        setAuthorized(true);
      } else {
        router.push('/admin/login');
      }
      setChecking(false);
    })();
  }, [router, isLoginPage]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Render login page directly with no sidebar/spinner
  if (isLoginPage) return <>{children}</>;

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#30363d] border-t-[#7d8590] rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-white">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-56 bg-[#161b22] border-r border-[#21262d] flex flex-col z-40">
        <div className="px-5 py-5">
          <div className="flex items-center gap-2.5">
            <img
              src="/math-club-logo.jpeg"
              alt="Math Club"
              className="w-8 h-8 rounded-lg object-cover border border-yellow-500/30 shrink-0"
            />
            <div>
              <p className="text-sm font-semibold leading-none text-white">Math Club</p>
              <p className="text-[11px] text-[#7d8590] mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, path, icon: Icon }) => {
            const isActive = path === '/admin'
              ? pathname === '/admin' || pathname === '/admin/'
              : pathname?.startsWith(path);
            return (
              <Link
                key={path}
                href={path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-[#21262d] text-[#f0f6fc] font-medium'
                    : 'text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d]'
                }`}
              >
                <Icon size={15} strokeWidth={1.6} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-[#7d8590] hover:text-red-400 hover:bg-[#161b22] transition-colors"
          >
            <LogOut size={15} strokeWidth={1.6} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen bg-[#0d1117]">
        {children}
      </main>
    </div>
  );
}
