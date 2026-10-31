// ============================================================
// supabaseClient.ts
// Singleton Supabase client initialised from Vite env vars.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your
// .env.local file (never commit secrets to version control).
// ============================================================

import { createClient } from '@supabase/supabase-js';

// ── Pull values injected by Vite at build time ──
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Create a .env.local file at the project root with these values.'
  );
}

// ── Create and export the shared client instance ──
export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Convenience: typed row shape matching the DB table ──
export interface BoardMember {
  id:            string;
  name:          string;
  position:      string;
  image_url:     string | null;
  linkedin_url:  string | null;
  github_url:    string | null;
  year:          string | null;
  display_order: number;
  created_at:    string;
}

// ── Storage helpers ──
export const AVATARS_BUCKET = 'board-avatars';

/** Returns the fully-qualified public URL for a stored avatar. */
export function getAvatarPublicUrl(path: string): string {
  const { data } = supabase.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

