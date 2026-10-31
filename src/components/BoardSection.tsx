// ============================================================
// BoardSection.tsx
// Public-facing Board showcase section for the WLUG website.
// Fetches members from Supabase, displays them in a responsive
// glassmorphic grid, and allows filtering by tenure year.
// Matches the site's dark Linux / developer aesthetic.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, UserCircle2, Terminal } from 'lucide-react';
// Brand icons not available in lucide-react v1.46 — using react-icons
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import { supabase, BoardMember } from '../lib/supabaseClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve a LinkedIn handle or full URL into a full profile link. */
function linkedinHref(val: string | null): string | null {
  if (!val) return null;
  return val.startsWith('http') ? val : `https://linkedin.com/in/${val}`;
}

/** Resolve a GitHub handle or full URL into a full profile link. */
function githubHref(val: string | null): string | null {
  if (!val) return null;
  return val.startsWith('http') ? val : `https://github.com/${val}`;
}

// ─── MemberCard ───────────────────────────────────────────────────────────────

/**
 * Glassmorphic member card matching the site's tech aesthetic.
 * Floating circular avatar, position pill badge, social links.
 */
const MemberCard: React.FC<{ member: BoardMember; index: number }> = ({ member, index }) => {
  const li = linkedinHref(member.linkedin_url);
  const gh = githubHref(member.github_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      // Floating avatar needs top margin to accommodate the overflow
      className="tech-card relative group flex flex-col bg-[#0A0A0F] pt-14 pb-6 px-5 mt-14"
    >
      {/* ── Floating circular avatar ── */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2
                      w-20 h-20 rounded-full border-4 border-[#0A0A0F] bg-[#12121A]
                      shadow-2xl overflow-hidden z-20
                      group-hover:-translate-y-2 group-hover:shadow-[#A0C4E2]/20
                      transition-all duration-500">
        {/* Frosted tint overlay on hover */}
        <div className="absolute inset-0 bg-[#A0C4E2]/10 mix-blend-overlay opacity-0
                        group-hover:opacity-100 transition-opacity duration-500 z-10" />

        {member.image_url ? (
          // Lazy-load avatar; desaturated by default, colour on hover
          <img
            src={member.image_url}
            alt={member.name}
            loading="lazy"
            className="w-full h-full object-cover object-center
                       grayscale group-hover:grayscale-0
                       scale-100 group-hover:scale-110
                       transition-all duration-700"
          />
        ) : (
          // Initials fallback with space-blue gradient
          <div className="w-full h-full flex items-center justify-center
                          bg-gradient-to-br from-[#1C3041] to-[#0A0A0F]">
            <span className="text-lg font-mono font-black text-[#A0C4E2]/60 uppercase
                             group-hover:text-[#A0C4E2] transition-colors">
              {member.name.substring(0, 2)}
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 items-center text-center gap-3">
        {/* Name */}
        <h3 className="text-base font-bold text-white leading-tight
                       group-hover:text-[#A0C4E2] transition-colors duration-300">
          {member.name}
        </h3>

        {/* Position badge — monospace pill in deep-space blue */}
        <span className="inline-block bg-[#1C3041] text-[#A0C4E2] text-[10px] font-mono
                         tracking-widest uppercase px-3 py-1 rounded-full
                         border border-[#A0C4E2]/20">
          {member.position}
        </span>

        {/* Year tag (smaller, muted) */}
        {member.year && (
          <span className="text-[9px] font-mono text-gray-600 tracking-wider">
            {member.year}
          </span>
        )}

        {/* ── Social icon row ── */}
        <div className="flex items-center justify-center gap-3 mt-auto
                        pt-4 border-t border-white/[0.05] w-full">
          {gh && (
            <a
              href={gh}
              target="_blank"
              rel="noopener noreferrer"
              title={`${member.name} on GitHub`}
              className="group/icon flex items-center justify-center w-8 h-8 rounded-lg
                         text-gray-600 hover:text-white hover:bg-white/10
                         transition-all duration-200"
            >
              <FiGithub className="w-4 h-4" />
            </a>
          )}
          {li && (
            <a
              href={li}
              target="_blank"
              rel="noopener noreferrer"
              title={`${member.name} on LinkedIn`}
              className="flex items-center justify-center w-8 h-8 rounded-lg
                         text-gray-600 hover:text-[#A0C4E2] hover:bg-[#A0C4E2]/10
                         transition-all duration-200"
            >
              <FiLinkedin className="w-4 h-4" />
            </a>
          )}
          {/* Neither social present */}
          {!gh && !li && (
            <span className="text-[10px] font-mono text-gray-700">no links</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Year Selector Dropdown ───────────────────────────────────────────────────

const YearSelector: React.FC<{
  years: string[];
  selected: string;
  onChange: (y: string) => void;
}> = ({ years, selected, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-30 inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between gap-3 min-w-[160px]
                   bg-[#0A0A0F] border border-[#A0C4E2]/20 rounded-xl px-4 py-3
                   text-white hover:bg-[#1C3041]/30 transition-colors
                   shadow-[0_0_20px_rgba(160,196,226,0.08)]"
      >
        <div className="flex flex-col items-start text-left">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Tenure Year</span>
          <span className="text-sm font-bold">{selected}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#A0C4E2] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full bg-[#12121A] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {years.map(year => (
              <button
                key={year}
                onClick={() => { onChange(year); setOpen(false); }}
                className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors
                  ${selected === year
                    ? 'bg-[#1C3041]/60 text-[#A0C4E2]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {year}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── BoardSection (root export) ───────────────────────────────────────────────

const BoardSection: React.FC = () => {
  // All fetched members (full dataset)
  const [allMembers, setAllMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Tenure-year selector state
  const [years, setYears]           = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');

  // ── Fetch all board members from Supabase on mount ──
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('board_members')
      .select('*')
      .order('year',          { ascending: false })
      .order('display_order', { ascending: true });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const members = (data as BoardMember[]) ?? [];
    setAllMembers(members);

    // Derive unique sorted years (newest first)
    const uniqueYears = Array.from(new Set(members.map(m => m.year ?? 'misc')))
      .sort()
      .reverse();

    setYears(uniqueYears);
    // Default to the most recent year
    if (uniqueYears.length > 0) setSelectedYear(uniqueYears[0]);

    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filter members by the selected year ──
  const displayed = selectedYear
    ? allMembers.filter(m => (m.year ?? 'misc') === selectedYear)
    : allMembers;

  return (
    <section className="pt-40 pb-20 px-6 min-h-screen relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px]
                      bg-[#1C3041]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px]
                      bg-[#A0C4E2]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          {/* Terminal-style monospace label */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-[#A0C4E2]/60" />
            <span className="text-xs font-mono text-[#A0C4E2]/60 uppercase tracking-widest">
              board_members.list()
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Meet the{' '}
            <span className="text-[#A0C4E2]">Team</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto font-mono leading-relaxed">
            The humans running WLUG — open-source advocates, kernel nerds, and community builders.
          </p>
        </motion.div>

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin text-[#A0C4E2]/50" />
            <span className="font-mono text-sm">Fetching board members…</span>
          </div>
        )}

        {/* ── Error state ── */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="text-red-400/60 font-mono text-sm border border-red-500/20 bg-red-950/20
                            px-6 py-4 rounded-xl text-center max-w-md">
              <p className="font-semibold mb-1">Failed to load board members</p>
              <p className="text-xs text-red-400/40">{error}</p>
            </div>
          </div>
        )}

        {/* ── Main content (year selector + grid) ── */}
        {!loading && !error && (
          <>
            {/* Year selector — only shown if multiple years exist */}
            {years.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex justify-center mb-14"
              >
                <YearSelector
                  years={years}
                  selected={selectedYear}
                  onChange={setSelectedYear}
                />
              </motion.div>
            )}

            {/* ── Member grid ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedYear}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {displayed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-600">
                    <UserCircle2 className="w-10 h-10 opacity-30" />
                    <p className="font-mono text-sm">No members found for {selectedYear}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
                                  gap-x-8 gap-y-6">
                    {displayed.map((member, i) => (
                      <MemberCard key={member.id} member={member} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
};

export default BoardSection;
