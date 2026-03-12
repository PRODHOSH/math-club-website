'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, Loader2, QrCode, RefreshCw, UserPlus } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  status: string;
  image: string | null;
}

interface Registration {
  id: string;
  name: string;
  reg_no: string;
  email: string;
  qr_token: string;
}

const EventRegister: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [registration, setRegistration] = useState<Registration | null>(null);

  // form state
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // QR rotation
  const [qrData, setQrData] = useState('');
  const [qrCountdown, setQrCountdown] = useState(30);

  const buildQrPayload = useCallback((token: string) => {
    return JSON.stringify({
      token,
      ts: Math.floor(Date.now() / 1000),
    });
  }, []);

  // Rotate QR every 30 seconds
  useEffect(() => {
    if (!registration) return;
    setQrData(buildQrPayload(registration.qr_token));
    setQrCountdown(30);

    const interval = setInterval(() => {
      setQrCountdown((c) => {
        if (c <= 1) {
          setQrData(buildQrPayload(registration.qr_token));
          return 30;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [registration, buildQrPayload]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, status, image')
        .eq('id', id)
        .single();
      if (!error && data) setEvent(data);
      setEventLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setError('');
    setSubmitting(true);

    // Check if already registered
    const { data: existing } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', event.id)
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      setRegistration(existing);
      setSubmitting(false);
      return;
    }

    // Insert new registration
    const { data, error: insertError } = await supabase
      .from('registrations')
      .insert({
        event_id: event.id,
        name: name.trim(),
        reg_no: regNo.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
      })
      .select()
      .single();

    if (insertError) {
      setError(`Registration failed: ${insertError.message}`);
    } else {
      setRegistration(data);
    }
    setSubmitting(false);
  };

  if (eventLoading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-yellow-500/30 border-t-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!event || (event.status !== 'upcoming' && event.status !== 'current')) {
    return (
      <div className="pt-32 min-h-screen px-4 flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold text-white text-center">Registration Not Available</h1>
        <p className="text-gray-400 text-center max-w-md">
          {!event ? 'Event not found.' : 'This event is not currently open for registration.'}
        </p>
        <Link href="/events" className="text-yellow-500 hover:text-yellow-400 underline">
          ← Back to Events
        </Link>
      </div>
    );
  }

  // Registered view
  if (registration) {
    const showQr = event.status === 'current';
    return (
      <div className="pt-24 min-h-screen pb-20 px-4 flex flex-col items-center">
        <div className="max-w-lg w-full">
          <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Back
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-8 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <CheckCircle size={32} className="text-green-400" />
              <h2 className="text-2xl font-bold text-white">You&apos;re Registered!</h2>
            </div>

            <div className="bg-[#161b22] rounded-xl p-4 mb-6 text-left space-y-2">
              <p className="text-[#7d8590] text-sm">Event</p>
              <p className="text-white font-semibold">{event.title}</p>
              <p className="text-[#7d8590] text-sm mt-3">Name</p>
              <p className="text-white">{registration.name}</p>
              <p className="text-[#7d8590] text-sm mt-3">Register No.</p>
              <p className="text-white font-mono">{registration.reg_no}</p>
            </div>

            {showQr ? (
              <>
                <p className="text-gray-400 text-sm mb-4">
                  Show this QR code at the event for check-in. It refreshes every 30 seconds.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-xl inline-block">
                    <QRCode
                      value={qrData}
                      size={220}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[#7d8590] text-sm">
                    <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                    Refreshes in {qrCountdown}s
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 mt-4">
                <QrCode size={48} className="text-[#30363d]" />
                <p className="text-[#7d8590] text-sm text-center">
                  Your QR code will appear here once the event goes live.
                </p>
                <p className="text-yellow-400 text-sm font-medium">
                  Status: Upcoming — check back on event day
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Registration form view
  return (
    <div className="pt-24 min-h-screen pb-20 px-4 flex flex-col items-center">
      <div className="max-w-lg w-full">
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
              <UserPlus size={20} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Register</h1>
          </div>
          <p className="text-white/40 text-sm mb-8 pl-[52px]">{event.title} &mdash; {event.date}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="group">
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                suppressHydrationWarning
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-green-500/60 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Register Number */}
            <div className="group">
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                Register Number
              </label>
              <input
                type="text"
                required
                placeholder="23BCX0000"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                suppressHydrationWarning
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-green-500/60 focus:bg-white/[0.07] transition-all tracking-wider"
              />
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="john@vit.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-green-500/60 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-red-400 text-xs leading-relaxed">{error}</span>
              </div>
            )}

            <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm tracking-wide shadow-lg shadow-green-900/30"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Register Now
                </>
              )}
            </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EventRegister;
