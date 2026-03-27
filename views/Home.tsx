'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Terminal, Cpu, Users, Calendar, Github, Shield, Code2, Video, Megaphone, Settings, Instagram, Youtube, MessageCircle, ChevronDown, ArrowUp, Palette, TrendingUp, BookOpen } from 'lucide-react';
import Link from 'next/link';


const departments = [
  {
    id: 1,
    name: 'Social Media & Design',
    description: 'Crafting the visual identity of the club across all platforms',
    icon: Palette,
    iconColor: 'text-pink-400',
    iconHoverColor: 'group-hover:text-pink-300',
    gradient: 'from-pink-500/10 via-pink-500/5 to-transparent',
    borderColor: 'border-pink-500/30',
    iconBg: 'bg-pink-500/20',
    iconBorder: 'border-pink-500/40',
    glow: 'rgba(236, 72, 153, 0.25)',
    longDesc: 'We manage the club\'s social media presence, create eye-catching graphics, design posters, and build a cohesive visual brand. If you love aesthetics and digital creativity, this is your team.'
  },
  {
    id: 3,
    name: 'Content & Outreach',
    description: 'Creating compelling content and expanding our community reach',
    icon: Megaphone,
    iconColor: 'text-purple-400',
    iconHoverColor: 'group-hover:text-purple-300',
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    borderColor: 'border-purple-500/30',
    iconBg: 'bg-purple-500/20',
    iconBorder: 'border-purple-500/40',
    glow: 'rgba(168, 85, 247, 0.25)',
    longDesc: 'We write articles, newsletters, and engaging posts that communicate the club\'s story. We also reach out to colleges, communities, and collaborators to grow our presence.'
  },
  {
    id: 4,
    name: 'Event Management',
    description: 'Planning and executing workshops, competitions, and gatherings',
    icon: Calendar,
    iconColor: 'text-orange-400',
    iconHoverColor: 'group-hover:text-orange-300',
    gradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
    borderColor: 'border-orange-500/30',
    iconBg: 'bg-orange-500/20',
    iconBorder: 'border-orange-500/40',
    glow: 'rgba(249, 115, 22, 0.25)',
    longDesc: 'We organize hackathons, math olympiads, workshops, and social events from ideation to execution. If you thrive in fast-paced environments and love bringing people together, join us.'
  },
  {
    id: 5,
    name: 'Marketing',
    description: 'Promoting events, driving engagement, and growing the brand',
    icon: TrendingUp,
    iconColor: 'text-green-400',
    iconHoverColor: 'group-hover:text-green-300',
    gradient: 'from-green-500/10 via-green-500/5 to-transparent',
    borderColor: 'border-green-500/30',
    iconBg: 'bg-green-500/20',
    iconBorder: 'border-green-500/40',
    glow: 'rgba(34, 197, 94, 0.25)',
    longDesc: 'We strategize campaigns, handle sponsorships, manage partnerships, and ensure maximum visibility for every club initiative. Blend creativity with strategy in this high-impact team.'
  },
  {
    id: 6,
    name: 'Research',
    description: 'Diving deep into mathematics and publishing insightful work',
    icon: BookOpen,
    iconColor: 'text-yellow-400',
    iconHoverColor: 'group-hover:text-yellow-300',
    gradient: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
    borderColor: 'border-yellow-500/30',
    iconBg: 'bg-yellow-500/20',
    iconBorder: 'border-yellow-500/40',
    glow: 'rgba(234, 179, 8, 0.25)',
    longDesc: 'We explore mathematical concepts, write research papers, conduct problem-solving sessions, and contribute to the academic pulse of the club. For those who live and breathe math.'
  }
];

const scatterConfig = [
  { rotate: -6, y: 16 },
  { rotate: 4,  y: -12 },
  { rotate: -3, y: 8 },
  { rotate: 5,  y: -8 },
  { rotate: -4, y: 12 },
];

const DepartmentsScattered: React.FC = () => (
  <div className="relative">
    {/* Row 1 — 3 cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
      {departments.slice(0, 3).map((dept, i) => {
        const Icon = dept.icon;
        const cfg = scatterConfig[i];
        return (
          <motion.div
            key={dept.id}
            animate={{ rotate: cfg.rotate, y: cfg.y }}
            whileHover={{ rotate: 0, y: -10, scale: 1.04, zIndex: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`relative bg-black rounded-2xl border ${dept.borderColor} p-6 flex flex-col gap-4 overflow-hidden cursor-default`}
            style={{ boxShadow: `0 0 30px ${dept.glow}` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${dept.gradient} pointer-events-none`} />
            <div className={`w-14 h-14 rounded-xl ${dept.iconBg} border ${dept.iconBorder} flex items-center justify-center`}>
              <Icon size={28} className={dept.iconColor} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-xl mb-1">{dept.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{dept.description}</p>
              <p className="text-white/70 text-sm leading-relaxed">{dept.longDesc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
    {/* Row 2 — 2 cards centered */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:w-2/3 mx-auto">
      {departments.slice(3).map((dept, i) => {
        const Icon = dept.icon;
        const cfg = scatterConfig[3 + i];
        return (
          <motion.div
            key={dept.id}
            animate={{ rotate: cfg.rotate, y: cfg.y }}
            whileHover={{ rotate: 0, y: -10, scale: 1.04, zIndex: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`relative bg-black rounded-2xl border ${dept.borderColor} p-6 flex flex-col gap-4 overflow-hidden cursor-default`}
            style={{ boxShadow: `0 0 30px ${dept.glow}` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${dept.gradient} pointer-events-none`} />
            <div className={`w-14 h-14 rounded-xl ${dept.iconBg} border ${dept.iconBorder} flex items-center justify-center`}>
              <Icon size={28} className={dept.iconColor} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-xl mb-1">{dept.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{dept.description}</p>
              <p className="text-white/70 text-sm leading-relaxed">{dept.longDesc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);



const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:shadow-[0_0_40px_rgba(234,179,8,0.7)] transition-all transform hover:scale-110 border border-yellow-400/30"
        >
          <ArrowUp className="text-white" size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const Home: React.FC = () => {
  const recentEvents = [
    {
      id: 7,
      title: 'The Man Who Knew Infinity',
      date: '22nd December 2025',
      description: 'A special screening of the film about Srinivasa Ramanujan\'s extraordinary journey into mathematics.',
      image: '/events/infinity.png',
    },
    {
      id: 6,
      title: 'Codemath Hackathon 2025',
      date: '18th December 2025',
      description: 'A 4-hour hackathon to build apps and games that make math intuitive and fun.',
      image: '/events/hackathon.png',
    },
    {
      id: 5,
      title: 'Number Knockout 2025',
      date: '17th December 2025',
      description: 'A high-energy solo math showdown — mental-math duels and speed calculations.',
      image: '/events/knockout.png',
    },
    {
      id: 4,
      title: 'Mathegraphy 2025',
      date: 'Deadline: 21st December 2025',
      description: 'Capture the hidden mathematics of the world — symmetry, fractals, golden ratio.',
      image: '/events/mathegraphy.png',
    },
  ];
  const [expandedFAQ, setExpandedFAQ] = React.useState<number | null>(null);
  const heroSlides = [
    '/hero/slide1.jpg',
    '/hero/slide2.jpg',
    '/hero/slide3.jpg',
    '/hero/slide4.png',
    '/hero/slide5.jpg',
  ];
  const [heroSlide, setHeroSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* ── Sliding background images ── */}
        <AnimatePresence mode="sync">
          <motion.div
            key={heroSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${heroSlides[heroSlide]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(6px) brightness(0.35)',
              transform: 'scale(1.05)',
            }}
          />
        </AnimatePresence>

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent,rgba(0,0,0,0.5))]" />

        {/* Dot grid */}
        <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

        {/* ── Centred content ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24 max-w-4xl mx-auto">

            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium tracking-widest uppercase mb-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              The Future of Mathematics
            </motion.span>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl sm:text-7xl md:text-[7rem] lg:text-[9rem] font-heading font-black leading-[0.85] tracking-tighter"
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500">
                MATHEMATICS
              </span>
              <span className="block text-yellow-400 drop-shadow-[0_0_60px_rgba(250,204,21,0.6)]">
                CLUB
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-2 text-xs text-gray-400 tracking-[0.25em] uppercase mt-1"
            >
              <span className="w-6 h-px bg-gray-600" /> VIT Chennai <span className="w-6 h-px bg-gray-600" />
            </motion.p>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="text-base sm:text-lg text-gray-300 max-w-lg leading-relaxed mt-4"
            >
              Where <span className="text-white font-semibold">logic meets imagination</span> — a home for problem solvers, thinkers, and math enthusiasts.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="flex items-center gap-4 mt-6"
            >
              <Link href="/recruitment">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 36px rgba(250,204,21,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-yellow-400 text-black font-bold rounded-full text-sm tracking-wider hover:bg-yellow-300 transition-colors"
                >
                  Join The Club <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="/events/past" className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors duration-200">
                View Events <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Slide indicator dots */}
            <div className="flex gap-2 mt-8">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroSlide(i)}
                  className={`rounded-full transition-all duration-400 ${
                    i === heroSlide ? 'w-6 h-2 bg-yellow-400' : 'w-2 h-2 bg-white/25 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
      </section>

      {/* About Brief */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 sm:mb-8">
                Where Numbers Meet <span className="text-yellow-500">Infinity</span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                Mathematics Club VIT Chennai isn't just a club — it's where curiosity becomes clarity. We dive deep into the elegance of pure math, the precision of applied math, and the thrill of competitive problem-solving, all in a community that genuinely loves numbers.
              </p>
              <motion.p 
                className="text-gray-400 text-base sm:text-lg leading-relaxed border-l-4 border-yellow-500 pl-4 sm:pl-6"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              >
                "Mathematics is not about numbers, equations, or algorithms — it is about understanding."
              </motion.p>
            </motion.div>
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-purple-600 blur-[60px] sm:blur-[80px] opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-700" />
              <div className="relative bg-black/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl hover:border-yellow-500/30 transition-colors">
                <div className="flex flex-col gap-6 sm:gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ delay: 0, duration: 0.5, ease: "easeOut" }}
                    className="flex items-center gap-4 sm:gap-6"
                  >
                    <div className="p-3 sm:p-4 bg-blue-500/10 rounded-xl sm:rounded-2xl text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <Terminal size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">Competitive Math</h3>
                      <p className="text-gray-400 text-sm sm:text-base">Olympiads, puzzles & math battles.</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                    className="flex items-center gap-4 sm:gap-6"
                  >
                    <div className="p-3 sm:p-4 bg-green-500/10 rounded-xl sm:rounded-2xl text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                      <Cpu size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">Applied Mathematics</h3>
                      <p className="text-gray-400 text-sm sm:text-base">Where equations meet the real world.</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                    className="flex items-center gap-4 sm:gap-6"
                  >
                    <div className="p-3 sm:p-4 bg-yellow-500/10 rounded-xl sm:rounded-2xl text-yellow-400 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                      <Users size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">500+ Strong Community</h3>
                      <p className="text-gray-400 text-sm sm:text-base">Learn and grow with fellow math lovers.</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Departments Section - Logo Loop */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-2">
              Our <span className="text-yellow-500">Departments</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">Where expertise meets innovation</p>
          </motion.div>

          <DepartmentsScattered />
        </div>
      </section>

      {/* Recent Events Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 bg-black/20">
         <div className="max-w-7xl mx-auto">
            <motion.div
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: false, margin: "-100px" }}
               transition={{ duration: 0.6, ease: "easeOut" }}
               className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4 sm:gap-6"
            >
               <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-3 sm:mb-4">Recent <span className="text-yellow-500">Highlights</span></h2>
                  <p className="text-gray-400 text-sm sm:text-base max-w-xl">See what we've been up to lately. From hackathons to workshops, we never stop building.</p>
               </div>
               <Link href="/events/past" className="flex items-center gap-2 text-yellow-500 font-bold hover:gap-4 transition-all text-sm sm:text-base">
                  View All Events <ArrowRight size={18} className="sm:w-5 sm:h-5" />
               </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
               {recentEvents.map((event, idx) => (
                  <motion.div
                     key={event.id}
                     initial={{ opacity: 0, y: 60, scale: 0.9 }}
                     whileInView={{ opacity: 1, y: 0, scale: 1 }}
                     viewport={{ once: false, margin: "-50px" }}
                     transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                     className="group relative h-80 sm:h-96 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer"
                  >
                     <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                     <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                        <div className="inline-flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
                           <Calendar size={12} className="sm:w-3.5 sm:h-3.5" /> {event.date}
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 leading-tight line-clamp-2">{event.title}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                           {event.description}
                        </p>
                        <div className="h-1 w-12 bg-yellow-500 rounded-full group-hover:w-full transition-all duration-500" />
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Photo Wall Section — Infinite Marquee */}
      <style>{`
        @keyframes marqueeLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .marquee-left  { animation: marqueeLeft  35s linear infinite; }
        .marquee-right { animation: marqueeRight 35s linear infinite; }
        .marquee-left:hover,
        .marquee-right:hover { animation-play-state: paused; }
      `}</style>
      <section className="py-20 px-0 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-2">Moments <span className="text-yellow-500">Captured</span></h2>
            <p className="text-gray-400 text-sm">A glimpse into life at Mathematics Club VIT Chennai</p>
          </motion.div>
        </div>

        {/* Scattered images grid */}
        <div className="relative px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Row 1 — 3 images */}
            <div className="flex gap-5 mb-5 items-end">
              <div className="rounded-2xl overflow-hidden flex-1" style={{ height: 260, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', transform: 'rotate(-2deg)' }}>
                <img src="/hero/slide4.png" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ width: '42%', height: 320, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', transform: 'rotate(1.5deg)' }}>
                <img src="/hero/slide2.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden flex-1" style={{ height: 250, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', transform: 'rotate(-1deg)' }}>
                <img src="/hero/slide3.jpg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            {/* Row 2 — 2 images */}
            <div className="flex gap-5 items-start">
              <div className="rounded-2xl overflow-hidden" style={{ width: '55%', height: 300, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', transform: 'rotate(1deg)' }}>
                <img src="/hero/slide1.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden flex-1" style={{ height: 270, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', transform: 'rotate(-1.5deg)' }}>
                <img src="/hero/slide5.jpg" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Frequently Asked Questions Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative z-10 bg-gradient-to-b from-black/20 via-slate-900/30 to-black/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-2">
              Frequently Asked <span className="text-yellow-500">Questions</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">Everything you need to know about Mathematics Club</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "How do I join Mathematics Club?",
                answer: "You can join Mathematics Club by clicking the 'Join Us' button in the navigation bar or visiting our recruitment page. We welcome all VIT Chennai students who are passionate about mathematics and analytical thinking."
              },
              {
                question: "What are the different departments?",
                answer: "We have five departments: Social Media & Design (visual identity and graphics), Content & Outreach (articles, newsletters, community reach), Event Management (hackathons, olympiads, workshops), Marketing (campaigns, sponsorships, partnerships), and Research (mathematical exploration and problem-solving)."
              },
              {
                question: "Do I need prior experience to join?",
                answer: "No prior experience is required! We welcome students at all skill levels. Our community is built on learning, collaboration, and peer-to-peer mentorship."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
                className="bg-black/90 border border-white/5 rounded-xl overflow-hidden hover:border-yellow-500/30 transition-all duration-300"
              >
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer"
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                >
                  <h3 className="text-lg font-bold text-white pr-4">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="text-gray-400" size={24} />
                  </motion.div>
                </div>
                <motion.div
                  initial={false}
                  animate={{ 
                    height: expandedFAQ === index ? 'auto' : 0,
                    opacity: expandedFAQ === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

export default Home;
