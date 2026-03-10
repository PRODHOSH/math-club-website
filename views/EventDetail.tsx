'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Calendar, Users, Trophy, ArrowLeft, Youtube, ExternalLink, Star, UserPlus } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  image: string;
  description: string;
  status: string;
  outcome: string | null;
  activities: string | null;
  registrations: number | null;
  youtube_link: string | null;
  highlights: string | null;
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) setEvent(data);
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-yellow-500/30 border-t-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-32 min-h-screen px-4 sm:px-6 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white mb-4">Event Not Found</h1>
        <Link href="/events" className="text-yellow-500 hover:text-yellow-400">
          Back to Events
        </Link>
      </div>
    );
  }

  const canRegister = event.status === 'upcoming' || event.status === 'current';

  return (
    <div className="pt-20 sm:pt-24 min-h-screen pb-16 sm:pb-20">
      {/* Back Button + Register */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-x-1"
        >
          <ArrowLeft size={22} />
          <span className="text-lg">Back</span>
        </button>
        {canRegister && (
          <Link
            href={`/events/${event.id}/register`}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <UserPlus size={20} />
            Register
          </Link>
        )}
      </div>

      {/* Hero Section with Image */}
      <div className="relative h-[40vh] sm:h-[50vh] mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10"></div>
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-2 bg-yellow-500 px-4 py-1.5 rounded-full">
                <Calendar size={16} className="text-white" />
                <span className="font-bold text-white text-sm">{event.date}</span>
              </div>
              {event.registrations && (
                <div className="flex items-center gap-2 bg-green-500 px-4 py-1.5 rounded-full">
                  <Users size={16} className="text-white" />
                  <span className="font-bold text-white text-sm">{event.registrations} Registrations</span>
                </div>
              )}
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${
                event.status === 'current' ? 'bg-blue-500 text-white' :
                event.status === 'upcoming' ? 'bg-orange-500 text-white' :
                'bg-gray-600 text-gray-200'
              }`}>
                {event.status}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 space-y-16">
        {/* Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <Trophy className="text-yellow-500" size={36} />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Overview</h2>
          </div>
          <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
            {event.description}
          </p>
        </motion.section>

        {/* Activities */}
        {event.activities && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-400 mb-8">Activities</h2>
            <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
              {event.activities}
            </p>
          </motion.section>
        )}

        {/* Highlights */}
        {event.highlights && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Star className="text-purple-400" size={32} />
              <h2 className="text-3xl sm:text-4xl font-bold text-purple-400">Key Highlights</h2>
            </div>
            <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
              {event.highlights}
            </p>
          </motion.section>
        )}

        {/* Outcome & Impact */}
        {event.outcome && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-green-400 mb-8">Outcome & Impact</h2>
            <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
              {event.outcome}
            </p>
          </motion.section>
        )}

        {/* YouTube Link */}
        {event.youtube_link && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center pt-4"
          >
            <a
              href={event.youtube_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-red-500/30 text-base sm:text-lg"
            >
              <Youtube size={24} />
              Watch Session Recording
              <ExternalLink size={20} />
            </a>
          </motion.div>
        )}

        {/* Register CTA */}
        {canRegister && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center pt-4"
          >
            <Link
              href={`/events/${event.id}/register`}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-green-500/30 text-lg"
            >
              <UserPlus size={24} />
              Register for This Event
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
