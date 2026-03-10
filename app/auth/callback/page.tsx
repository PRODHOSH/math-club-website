'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      // Explicitly exchange the ?code= for a session (PKCE)
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      // Get the session (also handles implicit #access_token flow)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      router.replace(profile?.role === 'admin' ? '/admin' : profile?.role === 'coordinator' ? '/core' : '/recruitment');
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b14]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}




