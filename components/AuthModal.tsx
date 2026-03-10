'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email || formData.username + '@vitchennai.edu',
          password: formData.password,
        });

        if (error) throw error;
        
        if (data.user) {
          onSuccess();
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          onSuccess();
        }
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        }
      });

      if (error) throw error;
      
      // The redirect will happen automatically
    } catch (error: any) {
      setError(error.message || 'Google authentication failed');
      console.error('Google auth error:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
            <div className="relative bg-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors z-20"
              >
                <X size={20} />
              </button>

              {/* Two column layout */}
              <div className="flex flex-col md:flex-row">
                {/* Left side - Logo and branding */}
                <div className="md:w-2/5 bg-gradient-to-br from-gray-900 to-black p-8 md:p-12 flex flex-col items-center justify-center border-r border-white/10">
                  <div className="inline-block p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-6">
                    <img 
                      src="/math-club-logo.jpeg" 
                      alt="Mathematics Club Logo" 
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl"
                    />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-white text-center">
                    Mathematics Club
                  </h2>
                </div>

                {/* Right side - Form */}
                <div className="md:w-3/5 p-8 md:p-12">
                  <div className="mb-8">
                    <h3 className="text-3xl font-heading font-bold text-white mb-2">Welcome Back</h3>
                    <p className="text-gray-400 text-sm">Enter your coordinates.</p>
                  </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username field */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {isLogin ? 'Username' : 'Email'}
                    </label>
                    <div className="relative">
                      <input
                        required
                        type={isLogin ? 'text' : 'email'}
                        name={isLogin ? 'username' : 'email'}
                        value={isLogin ? formData.username : formData.email}
                        onChange={handleChange}
                        placeholder={isLogin ? 'e.g. Euler' : 'your.email@example.com'}
                        className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        minLength={6}
                        className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Login/Signup button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-md bg-yellow-200 hover:bg-yellow-100 text-black font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-7">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-black text-gray-500 uppercase tracking-widest font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google auth button */}
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-3.5 rounded-md bg-transparent border border-white/20 hover:border-white/30 hover:bg-white/5 text-white font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </button>

                {/* Register/Login toggle link */}
                <p className="text-center text-sm text-gray-400 mt-7">
                  {isLogin ? "Need an account?" : "Already have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors underline"
                  >
                    {isLogin ? 'Register' : 'Login'}
                  </button>
                </p>
                </div>
              </div>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
