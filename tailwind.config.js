/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
       aspectRatio:{
        '3/2':'3/2'
       },
      colors: {
        canvas: 'var(--color-canvas)',
        ink: 'var(--color-ink)',
        'ink-deep': 'var(--color-ink-deep)',
        charcoal: 'var(--color-charcoal)',
        body: 'var(--color-body)',
        mute: 'var(--color-mute)',
        stone: 'var(--color-stone)',
        ash: 'var(--color-ash)',
        'surface-soft': 'var(--color-surface-soft)',
        'surface-card': 'var(--color-surface-card)',
        'surface-dark': 'var(--color-surface-dark)',
        'surface-dark-elevated': 'var(--color-surface-dark-elevated)',
        hairline: 'var(--color-hairline)',
        'hairline-strong': 'var(--color-hairline-strong)',
        'on-dark': 'var(--color-on-dark)',
        'on-dark-mute': 'var(--color-on-dark-mute)',
        'on-primary': 'var(--color-on-primary)',
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-active': 'var(--color-accent-active)',
        warning: 'var(--color-warning)',
        'warning-hover': 'var(--color-warning-hover)',
        'warning-active': 'var(--color-warning-active)',
        danger: 'var(--color-danger)',
        'danger-hover': 'var(--color-danger-hover)',
        'danger-active': 'var(--color-danger-active)',
        success: 'var(--color-success)',
      },
      fontFamily: {
        mono: [
          '"Berkeley Mono"',
          '"JetBrains Mono"',
          '"IBM Plex Mono"',
          '"Geist Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      fontSize: {
        // Unified type scale. Base = mobile (also tablet for h2/h3/h4),
        // -md = tablet-only breakpoint, -lg = desktop.
        // h1: 30 / 35 (tablet) / 38 (desktop)
        'h1': ['30px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
        'h1-md': ['35px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
        'h1-lg': ['38px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
        // h2: 25 / 30 (desktop)
        'h2': ['25px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
        'h2-lg': ['30px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
        // h3: 20 / 24 (desktop)
        'h3': ['20px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
        'h3-lg': ['24px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
        // h4: 16 / 18 (desktop)
        'h4': ['16px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
        'h4-lg': ['18px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
        'heading-md': ['16px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
        'display-xl': ['38px', { lineHeight: '1.5', fontWeight: '700', letterSpacing: '0' }],
      },
      spacing: {
        xxs: '1px',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
        section: '96px',
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
