import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import svelte from '@astrojs/svelte';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import astrowind from './vendor/integration';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://simplerosterai.com',
  output: 'static',
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  build: { inlineStylesheets: 'always' },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    svelte(),
    icon({ include: { tabler: ['*'] } }),
    // Only load partytown when analytics is actually configured (GA_ID set) —
    // no point offloading a script that never runs.
    ...(process.env.GA_ID ? [partytown({ config: { forward: ['dataLayer.push'] } })] : []),
    compress({
      CSS: true,
      HTML: { 'html-minifier-terser': { removeAttributeQuotes: false } },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),
    astrowind({ config: './src/config.yaml' }),
  ],
  vite: { resolve: { alias: { '~': path.resolve(__dirname, './src') } } },
});
