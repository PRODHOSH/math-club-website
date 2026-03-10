'use client';
import React from 'react';
import { Linkedin, Instagram, Youtube, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-black/40 border-t border-white/5 py-12 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-4">
              <img
                src="/math-club-logo.jpeg"
                alt="Mathematics Club Logo"
                className="w-14 h-14 rounded-xl border-2 border-yellow-500/30 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=MC&background=eab308&color=000&font-size=0.5';
                }}
              />
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Mathematics Club</h2>
                <p className="text-gray-500 text-sm">VIT Chennai</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              VIT Chennai's Mathematics Club. Fostering innovation, collaboration, and mathematical excellence among students.
            </p>
            <a
              href="https://chennai.vit.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 text-sm font-bold transition-colors group"
            >
              VIT Chennai Portal
              <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/"        className="hover:text-yellow-500 transition-colors">Home</Link></li>
              <li><Link href="/about"   className="hover:text-yellow-500 transition-colors">About Us</Link></li>
              <li><Link href="/domains" className="hover:text-yellow-500 transition-colors">Domains</Link></li>
              <li><Link href="/events"  className="hover:text-yellow-500 transition-colors">Events</Link></li>
              <li><Link href="/council" className="hover:text-yellow-500 transition-colors">Council</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div>
            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Get in Touch</h3>
            <a
              href="mailto:mathematicsclub.vitc@gmail.com"
              className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors group mb-6"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-all shrink-0">
                <Mail size={15} />
              </div>
              <span className="text-xs break-all">mathematicsclub.vitc@gmail.com</span>
            </a>
            <div className="flex gap-2.5">
              <SocialLink href="https://www.instagram.com/mathematics.club.vitcc/" icon={<Instagram size={18} />} hoverColor="hover:bg-pink-600" label="Instagram" />
              <SocialLink href="https://www.linkedin.com/company/mathematics-club-vitcc/posts/?feedView=all" icon={<Linkedin size={18} />} hoverColor="hover:bg-blue-600" label="LinkedIn" />
              <SocialLink href="#" icon={<Youtube size={18} />} hoverColor="hover:bg-red-600" label="YouTube" />
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Find Us</h3>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.0407049897726!2d80.15085337454471!3d12.84064621773688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5259af8e491f67%3A0x944b42131b757d2d!2sVellore%20Institute%20of%20Technology%20-%20Chennai!5e0!3m2!1sen!2sin!4v1773153806948!5m2!1sen!2sin"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="VIT Chennai Map"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">VIT Chennai, Kelambakkam - Vandalur Rd, Chennai</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-7">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 mb-4">
            <p>&copy; {new Date().getFullYear()} Mathematics Club - VIT Chennai. All rights reserved.</p>
            <div className="flex gap-5">
              <span className="hover:text-gray-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-gray-400 transition-colors cursor-pointer">Terms of Service</span>
              <Link href="/admin/login"           className="hover:text-gray-400 transition-colors">Admin Login</Link>
              <Link href="/admin/login?next=/core" className="hover:text-gray-400 transition-colors">Core Login</Link>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500">
            <p className="text-gray-500 mb-1">Developer of the Website</p>
            <a
              href="https://prodhosh.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-500 hover:text-yellow-400 transition-colors font-medium"
            >
              Prodhosh VS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon, hoverColor, label }: { href: string; icon: React.ReactNode; hoverColor: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 ${hoverColor} hover:text-white transition-all hover:-translate-y-0.5`}
  >
    {icon}
  </a>
);

export default Footer;