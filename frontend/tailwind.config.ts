import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        surfaceMuted: 'var(--surface-muted)',
        surfaceStrong: 'var(--surface-strong)',
        border: 'var(--border)',
        borderStrong: 'var(--border-strong)',
        borderMuted: 'var(--border-muted)',
        text: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        accent: 'var(--accent)',
        accentDark: 'var(--accent-dark)',
        accentMuted: 'var(--accent-muted)',
        accentPink: 'var(--accent-pink)',
        accentBlue: 'var(--accent-blue)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        success: 'var(--success)'
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    }
  },
  plugins: []
} satisfies Config;
