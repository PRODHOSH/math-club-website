-- Run this once in your Supabase SQL editor
-- Creates a settings table for site-wide toggles (e.g. recruitment open/closed)

CREATE TABLE IF NOT EXISTS public.settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Default: recruitment is closed
INSERT INTO public.settings (key, value)
VALUES ('recruitment_open', 'false')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for recruitment page check)
CREATE POLICY "settings_select_all"
  ON public.settings FOR SELECT
  USING (true);

-- Only authenticated users can write (admin checks happen in the app layer)
CREATE POLICY "settings_write_authenticated"
  ON public.settings FOR ALL
  USING (auth.role() = 'authenticated');
