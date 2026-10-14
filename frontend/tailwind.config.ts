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
        surfaceElevated: 'var(--surface-elevated)',
        foreground: 'var(--foreground)',
        foregroundMuted: 'var(--foreground-muted)',
        foregroundSubtle: 'var(--foreground-subtle)',
        border: 'var(--border)',
        borderStrong: 'var(--border-strong)',
        borderMuted: 'var(--border-muted)',
        text: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        accent: 'var(--accent)',
        accentDark: 'var(--accent-dark)',
        accentMuted: 'var(--accent-muted)',
        primary: 'var(--primary)',
        primaryHover: 'var(--primary-hover)',
        primaryActive: 'var(--primary-active)',
        primaryForeground: 'var(--primary-foreground)',
        accentPink: 'var(--accent-pink)',
        accentBlue: 'var(--accent-blue)',
        danger: 'var(--danger)',
        dangerMuted: 'var(--danger-muted)',
        dangerStrong: 'var(--danger-strong)',
        warning: 'var(--warning)',
        warningMuted: 'var(--warning-muted)',
        warningForeground: 'var(--warning-foreground)',
        success: 'var(--success)',
        successMuted: 'var(--success-muted)',
        info: 'var(--info)',
        infoMuted: 'var(--info-muted)'
      },
      boxShadow: {
        none: 'none',
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        modal: 'var(--shadow-modal)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)'
      },
      borderRadius: {
        control: 'var(--radius-control)',
        card: 'var(--radius-card)',
        dialog: 'var(--radius-dialog)',
        badge: 'var(--radius-badge)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)'
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        normal: 'var(--motion-normal)',
        slow: 'var(--motion-slow)'
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
