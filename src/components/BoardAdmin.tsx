// ============================================================
// BoardAdmin.tsx
// Full-lifecycle admin panel for WLUG board member management.
// Tab 1 – Bulk CSV import with avatar staging & batch commit.
// Tab 2 – Manage existing members (search, reorder, edit, delete).
// ============================================================

import React, { useState, useCallback, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import {
  Upload, Download, Trash2, Edit3, Save, X, Check,
  Search, Filter, Loader2, AlertCircle,
  Plus, ChevronDown, Image as ImageIcon,
  UserCircle2
} from 'lucide-react';
// Brand icons not in lucide-react — using react-icons instead
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import { supabase, BoardMember, AVATARS_BUCKET, getAvatarPublicUrl } from '../lib/supabaseClient';
import { compressAvatar, revokePreview, buildAvatarPath } from '../lib/imageUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A staged member record before it is committed to Supabase */
interface StagedMember {
  _localId:    string;           // client-only key
  name:        string;
  position:    string;
  year:        string;
  linkedin_url: string;
  github_url:  string;
  display_order: number;
  avatarBlob:  Blob | null;      // compressed WebP blob awaiting upload
  previewUrl:  string;           // local object URL for <img>
  error:       string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Validate required CSV columns exist in parsed row */
function validateStagedMember(m: Partial<StagedMember>): string {
  if (!m.name?.trim())     return 'Name is required';
  if (!m.position?.trim()) return 'Position is required';
  return '';
}

/** Tiny toast hook – returns [toasts, push function] */
function useToasts() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; ok: boolean }[]>([]);
  const push = useCallback((msg: string, ok = true) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, ok }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return [toasts, push] as const;
}

/** Generate a short UUID-ish string for local keys */
const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Sample CSV ───────────────────────────────────────────────────────────────

const SAMPLE_CSV_HEADERS = 'name,position,year,linkedin_url,github_url,display_order\n';
const SAMPLE_CSV_ROW     = 'Ada Lovelace,President,2026-27,ada-lovelace,ada-lovelace,1\n';

function downloadSampleCSV() {
  const blob = new Blob([SAMPLE_CSV_HEADERS + SAMPLE_CSV_ROW], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'board_members_sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Circular avatar dropzone shown per staged row */
const AvatarDropzone: React.FC<{
  preview: string;
  onFile: (f: File) => void;
  onRemove: () => void;
}> = ({ preview, onFile, onRemove }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Circular drop target */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative w-16 h-16 rounded-full cursor-pointer border-2 transition-all duration-200 overflow-hidden
          ${dragging
            ? 'border-[#A0C4E2] shadow-[0_0_20px_rgba(160,196,226,0.4)]'
            : 'border-white/10 hover:border-[#A0C4E2]/50'}`}
      >
        {preview ? (
          // Live circular avatar preview
          <img src={preview} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          // Placeholder state
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#1C3041]/40">
            <ImageIcon className="w-5 h-5 text-[#A0C4E2]/50" />
          </div>
        )}
        {/* Drag overlay */}
        {dragging && (
          <div className="absolute inset-0 bg-[#A0C4E2]/20 flex items-center justify-center">
            <Upload className="w-5 h-5 text-[#A0C4E2]" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />

      {/* Remove button if preview exists */}
      {preview && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="text-[10px] text-red-400/70 hover:text-red-400 font-mono transition-colors"
        >
          remove
        </button>
      )}
    </div>
  );
};

// ─── Edit Member Modal ────────────────────────────────────────────────────────

interface EditModalProps {
  member: BoardMember;
  onClose: () => void;
  onSaved: (updated: BoardMember) => void;
  toast: (msg: string, ok?: boolean) => void;
}

const EditMemberModal: React.FC<EditModalProps> = ({ member, onClose, onSaved, toast }) => {
  // Pre-fill form state from existing member record
  const [form, setForm] = useState({
    name:          member.name,
    position:      member.position,
    year:          member.year ?? '',
    display_order: member.display_order,
    linkedin_url:  member.linkedin_url ?? '',
    github_url:    member.github_url ?? '',
  });

  // Avatar replacement state
  const [newAvatarBlob, setNewAvatarBlob] = useState<Blob | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Clean up object URLs on unmount
  useEffect(() => () => { revokePreview(newAvatarPreview); }, [newAvatarPreview]);

  // Handle new avatar file selected or dropped
  const handleNewAvatar = async (file: File) => {
    revokePreview(newAvatarPreview);
    const { blob, previewUrl } = await compressAvatar(file);
    setNewAvatarBlob(blob);
    setNewAvatarPreview(previewUrl);
  };

  // Persist edits to Supabase
  const handleSave = async () => {
    if (!form.name.trim() || !form.position.trim()) {
      toast('Name and Position are required.', false);
      return;
    }

    setSaving(true);
    try {
      let imageUrl = member.image_url;

      // ── Upload new avatar if one was dropped ──
      if (newAvatarBlob) {
        const path = buildAvatarPath(form.name, form.year || 'misc', member.id);
        const { error: upErr } = await supabase.storage
          .from(AVATARS_BUCKET)
          .upload(path, newAvatarBlob, { upsert: true, contentType: 'image/webp' });
        if (upErr) throw upErr;
        imageUrl = getAvatarPublicUrl(path);
      }

      // ── Patch the board_members row ──
      const { data, error } = await supabase
        .from('board_members')
        .update({
          name:          form.name.trim(),
          position:      form.position.trim(),
          year:          form.year.trim() || null,
          display_order: Number(form.display_order),
          linkedin_url:  form.linkedin_url.trim() || null,
          github_url:    form.github_url.trim() || null,
          image_url:     imageUrl,
        })
        .eq('id', member.id)
        .select()
        .single();

      if (error) throw error;

      toast('Member updated successfully ✓');
      onSaved(data as BoardMember);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      toast(msg, false);
    } finally {
      setSaving(false);
    }
  };

  return (
    // Full-screen backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal panel – stop clicks propagating to backdrop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0A0A0F] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white font-mono">
            <span className="text-[#A0C4E2]">$</span> edit_member
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Avatar replacement dropzone */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1C3041]/20 border border-white/5">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
              {newAvatarPreview || member.image_url ? (
                <img
                  src={newAvatarPreview || member.image_url!}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1C3041]/60 flex items-center justify-center">
                  <UserCircle2 className="w-8 h-8 text-[#A0C4E2]/40" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 font-mono">Drop or click to replace photo</p>
              <AvatarDropzone
                preview=""
                onFile={handleNewAvatar}
                onRemove={() => { revokePreview(newAvatarPreview); setNewAvatarBlob(null); setNewAvatarPreview(''); }}
              />
            </div>
          </div>

          {/* Name & Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                           focus:outline-none focus:border-[#A0C4E2]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">Position *</label>
              <input
                value={form.position}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                           focus:outline-none focus:border-[#A0C4E2]/50 transition-colors"
              />
            </div>
          </div>

          {/* Year & Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">Year</label>
              <input
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                placeholder="2026-27"
                className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                           focus:outline-none focus:border-[#A0C4E2]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">Display Order</label>
              <input
                type="number"
                value={form.display_order}
                onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                           focus:outline-none focus:border-[#A0C4E2]/50 transition-colors"
              />
            </div>
          </div>

          {/* Social URLs */}
          <div>
            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">LinkedIn URL (handle or full URL)</label>
            <input
              value={form.linkedin_url}
              onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
              placeholder="username or https://linkedin.com/in/..."
              className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                         focus:outline-none focus:border-[#A0C4E2]/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">GitHub URL (handle or full URL)</label>
            <input
              value={form.github_url}
              onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
              placeholder="username or https://github.com/..."
              className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                         focus:outline-none focus:border-[#A0C4E2]/50 transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm
                       hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#A0C4E2]/20 border border-[#A0C4E2]/30
                       text-[#A0C4E2] text-sm font-semibold hover:bg-[#A0C4E2]/30 transition-colors
                       disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Tab 1: Add / Import Members ─────────────────────────────────────────────

const ImportTab: React.FC<{ toast: (msg: string, ok?: boolean) => void }> = ({ toast }) => {
  const [staged, setStaged]         = useState<StagedMember[]>([]);
  const [csvDragging, setCsvDragging] = useState(false);
  const [committing, setCommitting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // ── Parse a dropped / selected CSV file into staged rows ──
  const ingestCSV = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const rows: StagedMember[] = data.map(row => {
          const member: StagedMember = {
            _localId:      uid(),
            name:          (row.name ?? '').trim(),
            position:      (row.position ?? '').trim(),
            year:          (row.year ?? '').trim(),
            linkedin_url:  (row.linkedin_url ?? '').trim(),
            github_url:    (row.github_url ?? '').trim(),
            display_order: parseInt(row.display_order ?? '0') || 0,
            avatarBlob:    null,
            previewUrl:    '',
            error:         '',
          };
          member.error = validateStagedMember(member);
          return member;
        });
        setStaged(prev => [...prev, ...rows]);
        toast(`Imported ${rows.length} row(s) from CSV`);
      },
      error: (err) => toast(`CSV parse error: ${err.message}`, false),
    });
  };

  // ── Handle CSV file drop ──
  const handleCsvDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setCsvDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.name.endsWith('.csv')) ingestCSV(file);
    else toast('Please drop a .csv file', false);
  };

  // ── Add a blank manual row ──
  const addBlankRow = () => {
    setStaged(prev => [
      ...prev,
      {
        _localId: uid(), name: '', position: '', year: '',
        linkedin_url: '', github_url: '', display_order: prev.length,
        avatarBlob: null, previewUrl: '', error: 'Name is required',
      },
    ]);
  };

  // ── Update a field in a staged row ──
  const updateRow = (id: string, patch: Partial<StagedMember>) => {
    setStaged(prev => prev.map(r => {
      if (r._localId !== id) return r;
      const updated = { ...r, ...patch };
      updated.error = validateStagedMember(updated);
      return updated;
    }));
  };

  // ── Attach a compressed avatar blob to a staged row ──
  const handleAvatarFile = async (localId: string, file: File) => {
    const { blob, previewUrl } = await compressAvatar(file);
    // Clean up old preview URL to avoid memory leak
    setStaged(prev => prev.map(r => {
      if (r._localId !== localId) return r;
      revokePreview(r.previewUrl);
      return { ...r, avatarBlob: blob, previewUrl };
    }));
  };

  // ── Remove avatar from staged row ──
  const removeAvatar = (localId: string) => {
    setStaged(prev => prev.map(r => {
      if (r._localId !== localId) return r;
      revokePreview(r.previewUrl);
      return { ...r, avatarBlob: null, previewUrl: '' };
    }));
  };

  // ── Remove a staged row entirely ──
  const removeRow = (localId: string) => {
    setStaged(prev => {
      const row = prev.find(r => r._localId === localId);
      if (row) revokePreview(row.previewUrl);
      return prev.filter(r => r._localId !== localId);
    });
  };

  // ── Batch commit: upload avatars then upsert all rows ──
  const commitAll = async () => {
    const validRows = staged.filter(r => !r.error);
    if (!validRows.length) {
      toast('No valid rows to commit.', false);
      return;
    }

    setCommitting(true);
    try {
      // Process each valid row concurrently
      const records = await Promise.all(
        validRows.map(async (row) => {
          // Generate a temporary UUID for storage path derivation
          const tempId = uid() + uid(); // 16-char placeholder

          let imageUrl: string | null = null;

          // ── Upload avatar blob if provided ──
          if (row.avatarBlob) {
            const path = buildAvatarPath(row.name, row.year || 'misc', tempId);
            const { error: upErr } = await supabase.storage
              .from(AVATARS_BUCKET)
              .upload(path, row.avatarBlob, { upsert: true, contentType: 'image/webp' });
            if (upErr) throw upErr;
            imageUrl = getAvatarPublicUrl(path);
          }

          return {
            name:          row.name.trim(),
            position:      row.position.trim(),
            year:          row.year.trim() || null,
            display_order: row.display_order,
            linkedin_url:  row.linkedin_url.trim() || null,
            github_url:    row.github_url.trim() || null,
            image_url:     imageUrl,
          };
        })
      );

      // ── Batch upsert into Supabase ──
      const { error } = await supabase.from('board_members').insert(records);
      if (error) throw error;

      // Clean up previews for committed rows
      validRows.forEach(r => revokePreview(r.previewUrl));
      // Remove committed rows from staging; keep errored ones
      setStaged(prev => prev.filter(r => r.error));

      toast(`✓ Committed ${records.length} member(s) to the database`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Commit failed';
      toast(msg, false);
    } finally {
      setCommitting(false);
    }
  };

  const hasErrors = staged.some(r => r.error);
  const validCount = staged.filter(r => !r.error).length;

  return (
    <div className="space-y-6">
      {/* ── CSV Dropzone ── */}
      <div
        onDragOver={e => { e.preventDefault(); setCsvDragging(true); }}
        onDragLeave={() => setCsvDragging(false)}
        onDrop={handleCsvDrop}
        onClick={() => csvInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed
          cursor-pointer transition-all duration-300
          ${csvDragging
            ? 'border-[#A0C4E2] bg-[#A0C4E2]/5 shadow-[0_0_30px_rgba(160,196,226,0.15)]'
            : 'border-white/10 bg-[#12121A]/50 hover:border-white/20 hover:bg-[#12121A]'}`}
      >
        <Upload className={`w-8 h-8 transition-colors ${csvDragging ? 'text-[#A0C4E2]' : 'text-gray-600'}`} />
        <div className="text-center">
          <p className="text-white font-semibold">Drop your CSV here</p>
          <p className="text-xs text-gray-500 mt-1 font-mono">or click to browse</p>
        </div>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) ingestCSV(f); }}
        />
      </div>

      {/* ── Action row: sample + add blank ── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={downloadSampleCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 text-sm
                     hover:bg-white/5 hover:text-white transition-colors font-mono"
        >
          <Download className="w-4 h-4" />
          Download Sample CSV
        </button>
        <button
          onClick={addBlankRow}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#A0C4E2]/30
                     text-[#A0C4E2] text-sm hover:bg-[#A0C4E2]/10 transition-colors font-mono"
        >
          <Plus className="w-4 h-4" />
          Add Row Manually
        </button>
      </div>

      {/* ── Staged member cards ── */}
      {staged.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-gray-400">
              Staging Queue — <span className="text-[#A0C4E2]">{staged.length}</span> rows
              {hasErrors && <span className="ml-2 text-red-400">({staged.filter(r => r.error).length} with errors)</span>}
            </h3>
          </div>

          {staged.map((row) => (
            <motion.div
              key={row._localId}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors
                ${row.error
                  ? 'bg-red-950/20 border-red-500/20'
                  : 'bg-[#12121A] border-white/[0.06]'}`}
            >
              {/* Avatar dropzone */}
              <AvatarDropzone
                preview={row.previewUrl}
                onFile={f => handleAvatarFile(row._localId, f)}
                onRemove={() => removeAvatar(row._localId)}
              />

              {/* Editable fields */}
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-2">
                {(['name', 'position', 'year'] as const).map(field => (
                  <div key={field}>
                    <label className="block text-[9px] font-mono text-gray-600 mb-1 uppercase">{field}</label>
                    <input
                      value={row[field] as string}
                      onChange={e => updateRow(row._localId, { [field]: e.target.value })}
                      placeholder={field}
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white
                                 focus:outline-none focus:border-[#A0C4E2]/40 transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[9px] font-mono text-gray-600 mb-1 uppercase">LinkedIn</label>
                  <input
                    value={row.linkedin_url}
                    onChange={e => updateRow(row._localId, { linkedin_url: e.target.value })}
                    placeholder="handle or URL"
                    className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white
                               focus:outline-none focus:border-[#A0C4E2]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-gray-600 mb-1 uppercase">GitHub</label>
                  <input
                    value={row.github_url}
                    onChange={e => updateRow(row._localId, { github_url: e.target.value })}
                    placeholder="handle or URL"
                    className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white
                               focus:outline-none focus:border-[#A0C4E2]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-gray-600 mb-1 uppercase">Order</label>
                  <input
                    type="number"
                    value={row.display_order}
                    onChange={e => updateRow(row._localId, { display_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white
                               focus:outline-none focus:border-[#A0C4E2]/40 transition-colors"
                  />
                </div>
              </div>

              {/* Inline error message */}
              <div className="flex flex-col items-end gap-2">
                {row.error && (
                  <span className="flex items-center gap-1 text-[10px] text-red-400 font-mono whitespace-nowrap">
                    <AlertCircle className="w-3 h-3" />
                    {row.error}
                  </span>
                )}
                <button
                  onClick={() => removeRow(row._localId)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* ── Commit button ── */}
          <div className="flex justify-end pt-2">
            <button
              onClick={commitAll}
              disabled={committing || validCount === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C3041] border border-[#A0C4E2]/30
                         text-[#A0C4E2] font-semibold text-sm hover:bg-[#1C3041]/80 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(160,196,226,0.1)]"
            >
              {committing
                ? <><Loader2 className="w-4 h-4 animate-spin" />Committing…</>
                : <><Check className="w-4 h-4" />Commit {validCount} Member{validCount !== 1 ? 's' : ''}</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Tab 2: Manage Existing Members ──────────────────────────────────────────

const ManageTab: React.FC<{ toast: (msg: string, ok?: boolean) => void }> = ({ toast }) => {
  const [members, setMembers]       = useState<BoardMember[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [editTarget, setEditTarget] = useState<BoardMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BoardMember | null>(null);
  const [deleting, setDeleting]     = useState(false);

  // ── Fetch all members ordered by year desc, display_order asc ──
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('board_members')
      .select('*')
      .order('year', { ascending: false })
      .order('display_order', { ascending: true });
    if (error) toast('Failed to load members: ' + error.message, false);
    else setMembers((data as BoardMember[]) ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // ── Derive unique years for filter dropdown ──
  const years = ['all', ...Array.from(new Set(members.map(m => m.year ?? 'unknown'))).sort().reverse()];

  // ── Apply search + year filter ──
  const filtered = members.filter(m => {
    const matchYear   = yearFilter === 'all' || m.year === yearFilter;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchYear && matchSearch;
  });

  // ── Inline display_order update ──
  const handleOrderChange = async (member: BoardMember, newOrder: number) => {
    // Optimistic local update
    setMembers(prev =>
      prev.map(m => m.id === member.id ? { ...m, display_order: newOrder } : m)
    );
    const { error } = await supabase
      .from('board_members')
      .update({ display_order: newOrder })
      .eq('id', member.id);
    if (error) {
      toast('Order update failed: ' + error.message, false);
      // Revert on failure
      setMembers(prev =>
        prev.map(m => m.id === member.id ? { ...m, display_order: member.display_order } : m)
      );
    }
  };

  // ── Delete member + remove avatar from storage ──
  const handleDelete = async (member: BoardMember) => {
    setDeleting(true);
    try {
      // Remove avatar from storage if it exists
      if (member.image_url) {
        // Derive the storage path from the public URL
        const urlParts = member.image_url.split(`/${AVATARS_BUCKET}/`);
        if (urlParts.length === 2) {
          await supabase.storage.from(AVATARS_BUCKET).remove([urlParts[1]]);
        }
      }

      // Delete the database row
      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('id', member.id);
      if (error) throw error;

      // Remove from local state
      setMembers(prev => prev.filter(m => m.id !== member.id));
      toast(`Deleted ${member.name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      toast(msg, false);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or position…"
            className="w-full bg-[#12121A] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white
                       focus:outline-none focus:border-[#A0C4E2]/50 transition-colors placeholder-gray-600"
          />
        </div>

        {/* Year filter dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="appearance-none bg-[#12121A] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white
                       focus:outline-none focus:border-[#A0C4E2]/50 transition-colors cursor-pointer"
          >
            {years.map(y => (
              <option key={y} value={y} className="bg-[#12121A]">
                {y === 'all' ? 'All Years' : y}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
        </div>

        <button
          onClick={fetchMembers}
          className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm
                     hover:bg-white/5 hover:text-white transition-colors font-mono"
        >
          Refresh
        </button>
      </div>

      {/* ── Member list ── */}
      {loading ? (
        <div className="flex items-center justify-center h-40 gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-mono text-sm">Loading members…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-600">
          <UserCircle2 className="w-8 h-8" />
          <p className="font-mono text-sm">No members found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table header */}
          <div className="grid grid-cols-[40px_60px_1fr_1fr_80px_80px_100px] gap-3 px-4 py-2
                          text-[10px] font-mono text-gray-600 uppercase">
            <span>Order</span>
            <span>Photo</span>
            <span>Name</span>
            <span>Position / Year</span>
            <span>GitHub</span>
            <span>LinkedIn</span>
            <span className="text-right">Actions</span>
          </div>

          <AnimatePresence initial={false}>
            {filtered.map(member => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[40px_60px_1fr_1fr_80px_80px_100px] gap-3 items-center
                           px-4 py-3 bg-[#12121A] border border-white/[0.06] rounded-xl
                           hover:border-white/[0.12] transition-colors group"
              >
                {/* Inline order input */}
                <input
                  type="number"
                  defaultValue={member.display_order}
                  onBlur={e => handleOrderChange(member, parseInt(e.target.value) || 0)}
                  className="w-10 bg-[#0A0A0F] border border-white/10 rounded-lg px-1.5 py-1 text-xs text-center
                             text-gray-400 focus:outline-none focus:border-[#A0C4E2]/50 focus:text-white"
                />

                {/* Avatar thumbnail */}
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                  {member.image_url ? (
                    <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1C3041]/50 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-[#A0C4E2]/50 uppercase">
                        {member.name.substring(0, 2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <span className="text-sm text-white font-semibold truncate">{member.name}</span>

                {/* Position + Year */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-300 truncate">{member.position}</span>
                  {member.year && (
                    <span className="text-[10px] font-mono text-[#A0C4E2]/60">{member.year}</span>
                  )}
                </div>

                {/* GitHub link */}
                {member.github_url ? (
                  <a
                    href={member.github_url.startsWith('http') ? member.github_url : `https://github.com/${member.github_url}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-gray-600 hover:text-white transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    <FiGithub className="w-4 h-4" />
                  </a>
                ) : <span />}

                {/* LinkedIn link */}
                {member.linkedin_url ? (
                  <a
                    href={member.linkedin_url.startsWith('http') ? member.linkedin_url : `https://linkedin.com/in/${member.linkedin_url}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#A0C4E2] transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    <FiLinkedin className="w-4 h-4" />
                  </a>
                ) : <span />}

                {/* Edit + Delete actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditTarget(member)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-[#A0C4E2] hover:bg-[#A0C4E2]/10 transition-colors"
                    title="Edit member"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(member)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editTarget && (
          <EditMemberModal
            key={editTarget.id}
            member={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={updated =>
              setMembers(prev => prev.map(m => m.id === updated.id ? updated : m))
            }
            toast={toast}
          />
        )}
      </AnimatePresence>

      {/* ── Delete confirmation overlay ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0A0A0F] border border-red-500/20 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Confirm Delete</h3>
                  <p className="text-xs text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-6">
                Remove <span className="text-white font-semibold">{deleteTarget.name}</span> from the database and delete their avatar?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400
                             text-sm font-semibold hover:bg-red-500/30 transition-colors
                             disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Root: BoardAdmin ─────────────────────────────────────────────────────────

type AdminTab = 'import' | 'manage';

const BoardAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('import');
  const [toasts, pushToast]       = useToasts();

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'import', label: 'Add / Import Members', icon: <Upload className="w-4 h-4" /> },
    { id: 'manage', label: 'Manage & Edit Members', icon: <Edit3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white px-4 py-10">
      {/* ── Panel header ── */}
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#A0C4E2]/60 uppercase tracking-widest">
              WLUG_ADMIN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Board <span className="text-[#A0C4E2]">Admin Panel</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            Manage board member records, avatars, and tenure data.
          </p>
        </div>

        {/* ── Glassmorphic panel ── */}
        <div className="bg-[#0A0A0F]/80 border border-white/[0.06] rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-white/[0.06]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200
                  ${activeTab === tab.id
                    ? 'text-[#A0C4E2] border-b-2 border-[#A0C4E2] bg-[#A0C4E2]/5'
                    : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent hover:bg-white/[0.02]'}`}
              >
                {tab.icon}
                <span className="font-mono">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'import' ? (
                <motion.div
                  key="import"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ImportTab toast={pushToast} />
                </motion.div>
              ) : (
                <motion.div
                  key="manage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ManageTab toast={pushToast} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Toast notifications ── */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-mono shadow-2xl
                ${t.ok
                  ? 'bg-[#0A0A0F] border-emerald-500/30 text-emerald-400'
                  : 'bg-[#0A0A0F] border-red-500/30 text-red-400'}`}
            >
              {t.ok
                ? <Check className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BoardAdmin;
