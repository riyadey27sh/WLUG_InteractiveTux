// ============================================================
// imageUtils.ts
// Client-side image compression pipeline.
// Converts any .jpg / .png / .webp blob to a ~400×400 WebP
// under 80 KB using the browser Canvas API + browser-image-
// compression, with no server round-trip needed.
// ============================================================

import imageCompression from 'browser-image-compression';

/** Options tuned for board avatars: square crop target, <80 KB */
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.078,          // ≈ 80 KB ceiling
  maxWidthOrHeight: 400,     // square-ish output
  useWebWorker: true,        // non-blocking
  fileType: 'image/webp',    // force WebP output
  initialQuality: 0.82,      // good quality / size trade-off
};

/**
 * Compresses an image File to a WebP Blob sized for an avatar.
 * Returns both the compressed Blob and a local object-URL preview.
 */
export async function compressAvatar(
  file: File
): Promise<{ blob: Blob; previewUrl: string }> {
  // Run through browser-image-compression (canvas-based)
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

  // Generate a temporary URL for instant <img> preview
  const previewUrl = URL.createObjectURL(compressed);

  return { blob: compressed, previewUrl };
}

/**
 * Revokes a previously created object URL to free memory.
 * Always call this when a preview is no longer needed.
 */
export function revokePreview(url: string): void {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
}

/**
 * Derives a sanitised storage path for an avatar.
 * Pattern: {year}/{slug}-{shortId}.webp
 */
export function buildAvatarPath(
  name: string,
  year: string,
  id: string
): string {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const shortId = id.slice(0, 8);
  return `${year}/${slug}-${shortId}.webp`;
}

