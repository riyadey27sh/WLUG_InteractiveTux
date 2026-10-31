-- ============================================================
-- Migration: 001_board_members.sql
-- Creates the board_members table, RLS policies, and storage
-- bucket configuration for WLUG board management.
-- ============================================================

-- ── 1. Enable UUID extension (already enabled on Supabase by default) ──
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. Create the board_members table ──
CREATE TABLE IF NOT EXISTS public.board_members (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  position       TEXT        NOT NULL,
  image_url      TEXT,
  linkedin_url   TEXT,
  github_url     TEXT,
  year           TEXT,                          -- e.g. "2026-27"
  display_order  INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. Enable Row-Level Security ──
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

-- ── 4. RLS Policy: anyone can SELECT (public read) ──
CREATE POLICY "Public read access"
  ON public.board_members
  FOR SELECT
  USING (true);

-- ── 5. RLS Policy: only authenticated users can INSERT ──
CREATE POLICY "Authenticated insert"
  ON public.board_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ── 6. RLS Policy: only authenticated users can UPDATE ──
CREATE POLICY "Authenticated update"
  ON public.board_members
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── 7. RLS Policy: only authenticated users can DELETE ──
CREATE POLICY "Authenticated delete"
  ON public.board_members
  FOR DELETE
  TO authenticated
  USING (true);

-- ── 8. Helpful index for year-filtered queries ──
CREATE INDEX IF NOT EXISTS board_members_year_order_idx
  ON public.board_members (year, display_order ASC);

-- ============================================================
-- Storage: Create the board-avatars bucket
-- Run these via Supabase dashboard → Storage, or via the
-- Management API / supabase CLI as shown below.
-- ============================================================

-- NOTE: Storage bucket creation must be done via the Supabase
-- dashboard or Management API. The SQL equivalent is:
--
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('board-avatars', 'board-avatars', true)
--   ON CONFLICT (id) DO NOTHING;
--
-- Then add a public read storage policy:
--
--   CREATE POLICY "Public avatar read"
--     ON storage.objects FOR SELECT
--     USING ( bucket_id = 'board-avatars' );
--
--   CREATE POLICY "Auth avatar upload"
--     ON storage.objects FOR INSERT
--     TO authenticated
--     WITH CHECK ( bucket_id = 'board-avatars' );
--
--   CREATE POLICY "Auth avatar update"
--     ON storage.objects FOR UPDATE
--     TO authenticated
--     USING ( bucket_id = 'board-avatars' );
--
--   CREATE POLICY "Auth avatar delete"
--     ON storage.objects FOR DELETE
--     TO authenticated
--     USING ( bucket_id = 'board-avatars' );

