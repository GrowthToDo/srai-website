import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
        // Single source of truth lives in CustomStyles.astro channel vars
        // (theme audit 2026-07-21): editing the var moves every usage, and the
        // <alpha-value> form keeps opacity modifiers (border-ink/25) working.
        ink: 'rgb(var(--aw-rgb-ink) / <alpha-value>)',
        ivory: 'rgb(var(--aw-rgb-ivory) / <alpha-value>)',
        sage: 'rgb(var(--aw-rgb-sage) / <alpha-value>)',
        'green-deep': 'rgb(var(--aw-rgb-green-deep) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
      },

      animation: {
        fade: 'fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
      },

      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(1.25rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
  ],
  darkMode: 'class',
};
