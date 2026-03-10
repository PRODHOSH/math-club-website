import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  reg_number: string;
  year: string;
  department: string;
  experience: string;
  portfolio_link?: string;
  github_link?: string;
  linkedin_link?: string;
  why_join: string;
  created_at: string;
}
