-- ============================================================
-- EVENT REGISTRATION + ATTENDANCE SYSTEM  (v2)
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. events table additions
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_datetime   timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS sessions_enabled int DEFAULT 1;  -- how many sessions (1-3)
ALTER TABLE events ADD COLUMN IF NOT EXISTS active_session   int DEFAULT 1;  -- which session is live right now

-- 2. Registrations table (pre-loaded by coordinator via Excel/CSV)
CREATE TABLE IF NOT EXISTS registrations (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       text    NOT NULL,
  reg_no     text    NOT NULL,
  email      text    NOT NULL,
  qr_token   text    UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_at timestamptz DEFAULT now(),
  -- attendance columns (one per session)
  att_1_at   timestamptz DEFAULT NULL,
  att_2_at   timestamptz DEFAULT NULL,
  att_3_at   timestamptz DEFAULT NULL
);

-- If table already exists, add the new columns safely
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS att_1_at timestamptz DEFAULT NULL;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS att_2_at timestamptz DEFAULT NULL;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS att_3_at timestamptz DEFAULT NULL;

-- Deduplicate before creating unique indexes (keeps earliest record per pair)
DELETE FROM registrations
WHERE id NOT IN (
  SELECT DISTINCT ON (event_id, email)   id
  FROM registrations
  ORDER BY event_id, email, created_at ASC
);

DELETE FROM registrations
WHERE id NOT IN (
  SELECT DISTINCT ON (event_id, reg_no)  id
  FROM registrations
  ORDER BY event_id, reg_no, created_at ASC
);

-- Prevent duplicate registrations per event
CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_email_idx
  ON registrations (event_id, email);
CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_regno_idx
  ON registrations (event_id, reg_no);

-- 3. (Optional) Legacy attendance table — no longer used, can drop if clean install
-- DROP TABLE IF EXISTS attendance;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (safe to re-run)
DROP POLICY IF EXISTS "Anyone can register"                  ON registrations;
DROP POLICY IF EXISTS "Anyone can read registrations"        ON registrations;
DROP POLICY IF EXISTS "Authenticated can update attendance"  ON registrations;
DROP POLICY IF EXISTS "Authenticated can delete registrations" ON registrations;

-- Public: insert own registration (self-register flow) or coordinator imports
CREATE POLICY "Anyone can register"
  ON registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public: read own QR (by email lookup, or anyone — coordinator needs full read)
CREATE POLICY "Anyone can read registrations"
  ON registrations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated (coordinators/admin): update attendance columns
CREATE POLICY "Authenticated can update attendance"
  ON registrations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated: delete (for bulk re-import)
CREATE POLICY "Authenticated can delete registrations"
  ON registrations FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- AUTO PROMOTE FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION promote_events_to_current()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE events SET status = 'current'
  WHERE status = 'upcoming'
    AND event_datetime IS NOT NULL
    AND event_datetime <= now();
END;
$$;

GRANT EXECUTE ON FUNCTION promote_events_to_current() TO authenticated;
