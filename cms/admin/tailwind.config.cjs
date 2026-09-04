/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        ink: 'var(--color-ink)',
        charcoal: 'var(--color-charcoal)',
        body: 'var(--color-body)',
        mute: 'var(--color-mute)',
        stone: 'var(--color-stone)',
        ash: 'var(--color-ash)',
        'surface-soft': 'var(--color-surface-soft)',
        'surface-card': 'var(--color-surface-card)',
        hairline: 'var(--color-hairline)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      fontFamily: {
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      borderRadius: { DEFAULT: '4px', sm: '4px' },
    },
  },
  plugins: [],
};