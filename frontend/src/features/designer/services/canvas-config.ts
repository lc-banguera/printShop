/**
 * Canvas configuration for the PrintShop designer.
 *
 * All dimensions are in Konva coordinate units (artboard pixels).
 * Physical print dimensions are handled server-side at export time.
 */
export const CANVAS_CONFIG = {
  // ── Artboard ─────────────────────────────────────────────────
  // T-shirt artboard dimensions (px at 96 DPI equivalent)
  ARTBOARD_WIDTH: 794,
  ARTBOARD_HEIGHT: 1123,

  // ── Stage ────────────────────────────────────────────────────
  STAGE_SCALE: 0.7,
  STAGE_BACKGROUND: '#ffffff',
  CONTAINER_PADDING: 20,

  // ── Upload limits ────────────────────────────────────────────
  ACCEPTED_FILE_TYPES: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB

  // ── Konva Layer names ─────────────────────────────────────────
  // Render order (bottom → top): MOCKUP → USER_OBJECTS → SELECTION
  LAYERS: {
    BACKGROUND:   'background',   // unused — kept for backwards compat
    MOCKUP:       'mockup',       // locked t-shirt shape, never interactive
    CONTENT:      'content',      // alias for USER_OBJECTS (backwards compat)
    USER_OBJECTS: 'user-objects', // images, text, logos, stickers
    GUIDES:       'guides',       // printable-area border + future rulers
    SELECTION:    'selection',    // Konva Transformer
  },

  // ── Snapping ─────────────────────────────────────────────────
  // Reserved for future snap-to-grid / snap-to-guide implementation.
  SNAP_THRESHOLD: 8, // px
} as const;

// Design system colors (CSS variables — do not use raw hex here)
export const CANVAS_COLORS = {
  BACKGROUND:     'var(--background)',
  SURFACE:        'var(--surface)',
  BORDER:         'var(--border)',
  TEXT_PRIMARY:   'var(--text-primary)',
  TEXT_SECONDARY: 'var(--text-secondary)',
  ACCENT_TEAL:    'var(--accent-teal)',
  PRINTABLE_AREA: '#10b981', // emerald-500 — dashed guide border
} as const;
