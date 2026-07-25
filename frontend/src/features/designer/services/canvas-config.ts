export const CANVAS_CONFIG = {
  // Canvas dimensions (A4 size in pixels at 96 DPI)
  ARTBOARD_WIDTH: 794,
  ARTBOARD_HEIGHT: 1123,

  // Stage configuration
  STAGE_SCALE: 0.7, // Initial zoom level
  STAGE_BACKGROUND: '#ffffff',

  // Container configuration
  CONTAINER_PADDING: 20,

  // Accepted file types for future image uploads
  ACCEPTED_FILE_TYPES: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],

  // Maximum file size (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,

  // Layer names
  LAYERS: {
    BACKGROUND: 'background',
    CONTENT: 'content',
    SELECTION: 'selection',
  },
} as const;

// Design system colors
export const CANVAS_COLORS = {
  BACKGROUND: 'var(--background)',
  SURFACE: 'var(--surface)',
  BORDER: 'var(--border)',
  TEXT_PRIMARY: 'var(--text-primary)',
  TEXT_SECONDARY: 'var(--text-secondary)',
  ACCENT_TEAL: 'var(--accent-teal)',
} as const;
