# SimpleRosterAI Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build simplerosterai.com, a six-page Indian-market product site for AI nurse rostering, from the sibling US site's Astro codebase.

**Architecture:** Copy a pruned subset of the source Astro 5 + Tailwind + Svelte 5 scaffold into this repo, put every external contact value in one `src/site.ts` module, rework the pure TypeScript demo engine for three 8-hour shifts, and rewrite page copy in product voice for a Chief Nursing Officer buyer. A build-time script blocks production builds while `TODO_` placeholders remain, and a smoke script greps the built HTML for banned US-market terms and personal names.

**Tech Stack:** Astro 5.12, Tailwind 3.4, Svelte 5, TypeScript 5.8, Node 22 (`node --test` with built-in type stripping for engine tests), Python 3 + openpyxl for the roster template patch, Pillow for the OG image.

**Spec:** `docs/superpowers/specs/2026-09-02-simplerosterai-site-design.md`

## Global Constraints

- `$SRC` = the sibling US repo path, kept outside this repository (read-only, never modified).
- Target repo: this repo's local checkout (git already initialised on `main`, remote `origin` = `https://github.com/GrowthToDo/srai-website.git`). Never push; commit only.
- Git author is repo-local `SimpleRosterAI <dev@simplerosterai.com>`. Every commit message ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- No personal name other than Gautham, no US-market place or programme name, and no reference to the sibling US site's brand name or capture endpoints may appear anywhere in `src/`, `public/`, `scripts/`, `CLAUDE.md`, or `README.md`. Copyable exceptions: none.
- Only Gautham is named. His photo is `public/founders/gautham.png`, copied from `$SRC`.
- Vocabulary: duty roster (not schedule) in headings and CTAs, Staff Nurse / Senior Staff Nurse / Nursing Assistant, in-charge (not charge nurse), CNO, Nursing Superintendent, Nursing Supervisor, ward (not unit), absence (not callout), contract nurse (not staffing-firm or PRN), leave, weekly off, 48-hour week, 12-hour rest. British/Indian spelling: roster, organisation, licence, programme.
- Shifts everywhere: morning 07:00–15:00, evening 15:00–23:00, night 23:00–07:00.
- Currency: INR with Indian digit grouping (₹1,60,000), always "GST extra" next to a price.
- Pricing: ₹400 per nurse per month, ₹4,000 per nurse per year, hospital groups "talk to us". Only nurses are billed users.
- Placeholders live only in `src/site.ts` as values starting with `TODO_`. Pages import them; no page hard-codes a URL, email, or address.
- Primary CTA text: "Book a demo" (href `BOOKING_URL`). Secondary CTA text: "Try the interactive demo" (href `/demo`).
- Routes (exact): `/`, `/how-it-works`, `/demo`, `/pricing`, `/cost-calculator`, `/resources/nurse-duty-roster-template`, `/contact`, `/privacy`, `/terms`, `/404`.
- Verification commands that must pass at the end of every task: `npm run check` (astro check + eslint + prettier) and `npm run build`.
- Node scripts are ESM `.mjs`. Python scripts run with the system `python` (3.x, openpyxl and Pillow installed via `pip install openpyxl pillow` if missing).
- Prettier: printWidth 120, single quotes, semicolons, trailing commas es5. Run `npm run fix` before every commit.

## File Structure

| Path | Responsibility |
|---|---|
| `src/site.ts` | Single source of every external value (booking URL, email, capture URL, legal entity, prices). |
| `src/config.yaml` | AstroWind site config: name, URL, metadata, analytics (empty). |
| `src/navigation.ts` | Header and footer link data. |
| `src/layouts/Layout.astro`, `PageLayout.astro` | HTML shell, Organization schema, header + footer. |
| `src/components/widgets/Header.astro`, `Footer.astro`, `DarkHero.astro`, `CallToAction.astro`, `FAQs.astro`, `Steps.astro`, `ProductFlow.astro` | Shared page sections (copied, copy edited). |
| `src/components/ui/*` | Button, Headline, WidgetWrapper, Timeline, Background, forms/ContactForm. |
| `src/components/common/*` | Meta, analytics, scripts (copied). |
| `src/components/demo-scheduler/engine.ts` | Pure rostering engine, three 8-hour shifts, Indian rules. |
| `src/components/demo-scheduler/engine.test.ts` | Node test suite for the engine. |
| `src/components/demo-scheduler/DemoScheduler.svelte` | Interactive demo UI. |
| `src/components/widgets/CostCalculatorWidget.svelte`, `CostCalculatorSection.astro` | INR cost calculator. |
| `src/pages/*.astro` | The ten routes. |
| `scripts/check-placeholders.mjs` | Fails production build on `TODO_` in `dist/`. |
| `scripts/smoke.mjs` | Verifies route set and banned terms in `dist/`. |
| `scripts/build-template.py` | Patches the source workbook into the Indian roster template. |
| `scripts/build-social.py` | Generates `src/assets/images/social.png`. |
| `public/downloads/SimpleRosterAI-Nurse-Duty-Roster-Template.xlsx` | Generated template. |
| `CLAUDE.md`, `README.md` | Repo instructions. |

---

### Task 1: Scaffold, config, placeholders, and a building 404

**Files:**
- Copy from `$SRC` (verbatim unless noted): `astro.config.ts` (edited), `tailwind.config.js`, `tsconfig.json`, `eslint.config.js`, `.prettierrc.cjs`, `.prettierignore`, `.editorconfig`, `.npmrc`, `.gitattributes`, `vercel.json`, `vendor/` (whole folder), `src/env.d.ts`, `src/types.d.ts`, `src/assets/styles/tailwind.css`, `src/assets/favicons/*`, `src/components/CustomStyles.astro`, `src/components/Favicons.astro`, `src/components/Logo.astro`, `src/components/common/{ApplyColorMode,Analytics,BasicScripts,CommonMeta,Image,Metadata,MotionScripts,SchemaOrg,SiteVerification,ToggleMenu,ToggleTheme}.astro`, `src/components/ui/{Background,Button,Headline,Timeline,WidgetWrapper}.astro`, `src/utils/{utils,permalinks,images,images-optimization}.ts`, `src/layouts/{Layout,PageLayout}.astro` (Layout edited), `public/{favicon.ico,icon.svg,icon-192.png,icon-512.png,apple-touch-icon.png,_headers}`, `public/founders/gautham.png`.
- Create: `package.json`, `.gitignore`, `src/config.yaml`, `src/site.ts`, `src/navigation.ts`, `src/pages/404.astro`, `scripts/check-placeholders.mjs`, `public/robots.txt`, `public/manifest.webmanifest`, `netlify.toml`.

**Interfaces:**
- Produces `src/site.ts` exports used by every later task:
  `SITE_NAME: string`, `SITE_URL: string`, `BOOKING_URL: string`, `SUPPORT_EMAIL: string`, `LEAD_CAPTURE_URL: string`, `LEGAL_ENTITY_NAME: string`, `LEGAL_ADDRESS: string`, `PRICE_MONTHLY_INR: number`, `PRICE_ANNUAL_INR: number`, `formatINR(n: number): string`.
- Produces `npm run build`, `npm run check`, `npm run fix`, `npm run test`, `npm run smoke` scripts.

- [ ] **Step 1: Copy the scaffold**

Run from the target repo root (Git Bash):

```bash
S="$SRC"
mkdir -p src/assets/styles src/assets/favicons src/assets/images src/components/common src/components/ui/forms src/components/widgets src/components/demo-scheduler src/layouts src/utils src/pages/resources scripts public/founders public/downloads
cp "$S"/{tailwind.config.js,tsconfig.json,eslint.config.js,.prettierrc.cjs,.prettierignore,.editorconfig,.npmrc,.gitattributes,vercel.json} .
cp -r "$S"/vendor ./vendor
cp "$S"/src/env.d.ts "$S"/src/types.d.ts src/
cp "$S"/src/assets/styles/tailwind.css src/assets/styles/
cp "$S"/src/assets/favicons/* src/assets/favicons/
cp "$S"/src/components/{CustomStyles,Favicons,Logo}.astro src/components/
for f in ApplyColorMode Analytics BasicScripts CommonMeta Image Metadata MotionScripts SchemaOrg SiteVerification ToggleMenu ToggleTheme; do cp "$S/src/components/common/$f.astro" src/components/common/; done
for f in Background Button Headline Timeline WidgetWrapper; do cp "$S/src/components/ui/$f.astro" src/components/ui/; done
cp "$S"/src/utils/{utils,permalinks,images,images-optimization}.ts src/utils/
cp "$S"/src/layouts/{Layout,PageLayout}.astro src/layouts/
cp "$S"/public/{favicon.ico,icon.svg,icon-192.png,icon-512.png,apple-touch-icon.png,_headers} public/
cp "$S"/public/founders/gautham.png public/founders/
```

- [ ] **Step 2: Write package.json**

```json
{
  "name": "simplerosterai-site",
  "version": "0.1.0",
  "description": "SimpleRosterAI marketing site",
  "type": "module",
  "private": true,
  "engines": { "node": ">=20.3.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && node scripts/check-placeholders.mjs",
    "preview": "astro preview",
    "astro": "astro",
    "check": "npm run check:astro && npm run check:eslint && npm run check:prettier",
    "check:astro": "astro check",
    "check:eslint": "eslint .",
    "check:prettier": "prettier --check .",
    "fix": "eslint --fix . && prettier -w .",
    "test": "node --experimental-strip-types --test src/components/demo-scheduler/engine.test.ts",
    "smoke": "node scripts/smoke.mjs"
  },
  "dependencies": {
    "@astrojs/sitemap": "^3.4.2",
    "@astrojs/svelte": "^7.2.5",
    "@astrolib/analytics": "^0.6.1",
    "@astrolib/seo": "^1.0.0-beta.8",
    "@fontsource-variable/fraunces": "^5.2.9",
    "@fontsource-variable/inter": "^5.2.6",
    "astro": "^5.12.9",
    "astro-icon": "^1.1.5",
    "limax": "4.1.0",
    "lodash.merge": "^4.6.2",
    "svelte": "^5.53.7",
    "unpic": "^4.1.3"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@astrojs/partytown": "^2.1.4",
    "@astrojs/tailwind": "^5.1.5",
    "@eslint/js": "^9.33.0",
    "@iconify-json/tabler": "^1.2.20",
    "@tailwindcss/typography": "^0.5.16",
    "@types/js-yaml": "^4.0.9",
    "@types/lodash.merge": "^4.6.9",
    "@typescript-eslint/eslint-plugin": "^8.39.0",
    "@typescript-eslint/parser": "^8.39.0",
    "astro-compress": "2.3.8",
    "astro-eslint-parser": "^1.2.2",
    "eslint": "^9.33.0",
    "eslint-plugin-astro": "^1.3.1",
    "globals": "^16.3.0",
    "js-yaml": "^4.1.0",
    "prettier": "^3.6.2",
    "prettier-plugin-astro": "^0.14.1",
    "sharp": "0.34.3",
    "tailwind-merge": "^2.6.0",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.39.0"
  }
}
```

- [ ] **Step 3: Write .gitignore**

```
dist/
.output/
node_modules/
npm-debug.log*
.env
.env.local
.env.production
.DS_Store
.astro
.tmp/
.claude/settings.local.json
```

- [ ] **Step 4: Write src/site.ts**

```ts
/**
 * Single source of truth for every external value on the site.
 * Values starting with TODO_ are placeholders; scripts/check-placeholders.mjs
 * fails a production build (SITE_ENV=production) while any remain in dist/.
 */
export const SITE_NAME = 'SimpleRosterAI';
export const SITE_URL = 'https://simplerosterai.com';

export const BOOKING_URL = 'TODO_BOOKING_URL';
export const SUPPORT_EMAIL = 'TODO_SUPPORT_EMAIL';
export const LEAD_CAPTURE_URL = 'TODO_LEAD_CAPTURE_URL';
export const LEGAL_ENTITY_NAME = 'TODO_LEGAL_ENTITY_NAME';
export const LEGAL_ADDRESS = 'TODO_LEGAL_ADDRESS';

export const PRICE_MONTHLY_INR = 400;
export const PRICE_ANNUAL_INR = 4000;

/** ₹12,34,567 — Indian digit grouping, no decimals. */
export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
```

- [ ] **Step 5: Write src/config.yaml**

```yaml
site:
  name: SimpleRosterAI
  site: 'https://simplerosterai.com'
  base: '/'
  trailingSlash: false
  googleSiteVerificationId: ''

metadata:
  title:
    default: SimpleRosterAI
    template: '%s — SimpleRosterAI'
  description: 'AI nurse duty rostering for Indian hospitals. The engine builds every ward roster against 48-hour, rest and weekly-off rules; your nursing office approves.'
  robots:
    index: true
    follow: true
  openGraph:
    site_name: SimpleRosterAI
    images:
      - url: '~/assets/images/social.png'
        width: 1200
        height: 628
    type: website
  twitter:
    cardType: summary_large_image

i18n:
  language: en-IN
  textDirection: ltr

apps:
  blog:
    isEnabled: false
    postsPerPage: 1
    post:
      isEnabled: false
      permalink: '/blog/%slug%'
      robots:
        index: false
    list:
      isEnabled: false
      pathname: 'blog'
      robots:
        index: false
    category:
      isEnabled: false
      pathname: 'category'
      robots:
        index: false
    tag:
      isEnabled: false
      pathname: 'tag'
      robots:
        index: false
    isRelatedPostsEnabled: false
    relatedPostsCount: 0

analytics:
  vendors:
    googleAnalytics:
      id: ''
      partytown: true

ui:
  theme: 'light:only'
```

- [ ] **Step 6: Write astro.config.ts**

```ts
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
    partytown({ config: { forward: ['dataLayer.push'] } }),
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
```

- [ ] **Step 7: Edit the copied Layout.astro**

Replace the whole `const orgSchema = { ... };` block with:

```ts
import { SITE_NAME, SITE_URL, SUPPORT_EMAIL } from '~/site';

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description: 'AI nurse duty rostering software for Indian hospitals.',
  areaServed: { '@type': 'Country', name: 'India' },
  founder: [{ '@type': 'Person', name: 'Gautham' }],
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: SUPPORT_EMAIL },
};
```

(The `import` line goes with the other imports at the top of the frontmatter.) Delete the entire Microsoft Clarity `{ import.meta.env.PROD && ( <script type="text/partytown"> ... ) }` block. Keep everything else.

In the copied `src/components/common/CommonMeta.astro`, delete the `<link rel="alternate" type="application/rss+xml" ...>` line.

In the copied `src/components/common/SiteVerification.astro`, delete the `<meta name="msvalidate.01" ...>` line.

- [ ] **Step 8: Write src/navigation.ts**

```ts
import { getPermalink } from './utils/permalinks';
import { BOOKING_URL } from './site';

export const headerData = {
  links: [
    { text: 'Home', href: getPermalink('/') },
    { text: 'How it works', href: getPermalink('/how-it-works') },
    { text: 'Demo', href: getPermalink('/demo') },
    { text: 'Pricing', href: getPermalink('/pricing') },
    {
      text: 'Resources',
      links: [
        { text: 'Cost calculator', href: getPermalink('/cost-calculator') },
        { text: 'Free duty roster template', href: getPermalink('/resources/nurse-duty-roster-template') },
      ],
    },
  ],
  actions: [{ text: 'Book a demo', href: BOOKING_URL, variant: 'primary' as const }],
};

export const footerData = {
  links: [
    {
      title: 'Product',
      links: [
        { text: 'How it works', href: getPermalink('/how-it-works') },
        { text: 'Interactive demo', href: getPermalink('/demo') },
        { text: 'Pricing', href: getPermalink('/pricing') },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'Cost calculator', href: getPermalink('/cost-calculator') },
        { text: 'Free duty roster template', href: getPermalink('/resources/nurse-duty-roster-template') },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'Contact', href: getPermalink('/contact') },
        { text: 'Privacy', href: getPermalink('/privacy') },
        { text: 'Terms', href: getPermalink('/terms') },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [],
  footNote: 'Built for Indian hospitals.',
};
```

- [ ] **Step 9: Write src/pages/404.astro**

```astro
---
import Layout from '~/layouts/Layout.astro';
import { getHomePermalink } from '~/utils/permalinks';

const metadata = {
  title: 'Page not found',
  description: 'The page you were looking for does not exist. Return to the SimpleRosterAI homepage.',
  robots: { index: false },
};
---

<Layout metadata={metadata}>
  <section class="flex items-center h-full p-16">
    <div class="container flex flex-col items-center justify-center px-5 mx-auto my-8">
      <div class="max-w-md text-center">
        <h2 class="mb-8 font-bold text-9xl">
          <span class="sr-only">Error</span>
          <span class="text-primary">404</span>
        </h2>
        <p class="text-3xl font-semibold">Sorry, we could not find this page.</p>
        <p class="mt-4 mb-8 text-lg text-muted">Head back to the homepage to find what you need.</p>
        <a rel="noopener noreferrer" href={getHomePermalink()} class="btn">Back to homepage</a>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 10: Write scripts/check-placeholders.mjs**

```js
#!/usr/bin/env node
// Scans dist/ for unfilled TODO_ placeholders (they originate in src/site.ts).
// Warns locally; fails when SITE_ENV=production so a launch build cannot ship them.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(html|js|xml|txt|json)$/.test(entry.name)) {
      const text = fs.readFileSync(p, 'utf8');
      const found = [...new Set(text.match(/TODO_[A-Z_]+/g) ?? [])];
      if (found.length) hits.push({ file: path.relative(dist, p), found });
    }
  }
}

if (!fs.existsSync(dist)) {
  console.error('check-placeholders: dist/ not found, run astro build first');
  process.exit(1);
}
walk(dist);

if (hits.length === 0) {
  console.log('check-placeholders: no TODO_ placeholders in dist/');
  process.exit(0);
}
const names = [...new Set(hits.flatMap((h) => h.found))].sort();
const message = `check-placeholders: ${names.length} placeholder(s) still set in src/site.ts: ${names.join(', ')}`;
if (process.env.SITE_ENV === 'production') {
  console.error(message);
  process.exit(1);
}
console.warn(message + ' (warning only; set SITE_ENV=production to fail)');
```

- [ ] **Step 11: Write public/robots.txt, public/manifest.webmanifest, netlify.toml**

`public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://simplerosterai.com/sitemap-index.xml
```

`public/manifest.webmanifest`:
```json
{
  "short_name": "SimpleRosterAI",
  "name": "SimpleRosterAI",
  "icons": [
    { "src": "./icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "display": "minimal-ui",
  "id": "/",
  "start_url": "/",
  "theme_color": "#faf7f2",
  "background_color": "#2d5a4a"
}
```

`netlify.toml`:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.processing.html]
  pretty_urls = false

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/downloads/*"
  [headers.values]
    Cache-Control = "public, max-age=300, must-revalidate"

[[redirects]]
  from = "/*"
  to = "/404"
  status = 404
```

- [ ] **Step 12: Install and build**

Run:
```bash
npm install
npm run build
```
Expected: build succeeds, `dist/404.html` exists, and the placeholder script prints a warning naming zero placeholders (the 404 page uses none). If `astro check` complains that `astrowind:config` types are missing, confirm `vendor/integration/types.d.ts` was copied.

Run `npm run check`. Expected: exit 0. Fix any prettier diffs with `npm run fix`.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "chore: scaffold SimpleRosterAI site from source template

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Header, footer, shared widgets, contact, privacy, terms

**Files:**
- Copy from `$SRC/src/components/widgets/`: `Header.astro` (unchanged), `DarkHero.astro` (unchanged), `CallToAction.astro` (unchanged), `FAQs.astro` (unchanged), `Steps.astro` (unchanged).
- Create: `src/components/widgets/Footer.astro`, `src/components/ui/forms/ContactForm.astro`, `src/pages/contact.astro`, `src/pages/privacy.astro`, `src/pages/terms.astro`.

**Interfaces:**
- Consumes `src/site.ts` exports from Task 1.
- Produces the `DarkHero`, `CallToAction`, `FAQs`, `Steps` widgets with the same props as the source (title, subtitle, badge/tagline, actions array of `{ text, href, variant }`, `items`).

- [ ] **Step 1: Copy unchanged widgets**

```bash
S="$SRC"
for f in Header DarkHero CallToAction FAQs Steps; do cp "$S/src/components/widgets/$f.astro" src/components/widgets/; done
```

- [ ] **Step 2: Write src/components/widgets/Footer.astro**

Copy `$SRC/src/components/widgets/Footer.astro`, then replace the brand section (everything inside `<div class="border-b border-ivory/15 py-8 md:py-12">`) with:

```astro
<div class="max-w-3xl">
  <a href={getHomePermalink()} class="inline-block text-2xl font-heading font-semibold tracking-tight mb-4" translate="no">
    {SITE_NAME}<span class="text-sage">.</span>
  </a>
  <p class="text-ivory/70 mb-6 text-base leading-relaxed">
    AI nurse duty rostering for Indian hospitals. The engine builds every ward roster against your rules, your nursing
    office approves, and every nurse sees their duties on their phone.
  </p>
  <div class="flex flex-wrap gap-3">
    <a href="/how-it-works" class="btn-secondary-dark">How it works</a>
    <a href="/demo" class="btn-secondary-dark">Try the interactive demo</a>
    <a href={BOOKING_URL} class="btn-primary">Book a demo</a>
  </div>
</div>
```

and add to the frontmatter imports: `import { SITE_NAME, BOOKING_URL } from '~/site';`. Remove the `<address>` block entirely.

- [ ] **Step 3: Write src/components/ui/forms/ContactForm.astro**

Copy `$SRC/src/components/ui/forms/ContactForm.astro`. Replace the frontmatter with:

```astro
---
import { LEAD_CAPTURE_URL } from '~/site';

const formStrings = {
  name: 'Name',
  email: 'Work email',
  message: 'Message (hospital, bed count, how you roster today)',
  submit: 'Send',
  submitting: 'Sending...',
  success: 'Thank you. We will reply within one working day.',
  error: 'Something went wrong. Please try again or email us directly.',
};
const GOOGLE_SCRIPT_URL = LEAD_CAPTURE_URL;
---
```

Leave the markup and `<script define:vars={{ GOOGLE_SCRIPT_URL, formStrings }}>` block unchanged.

- [ ] **Step 4: Write src/pages/contact.astro**

```astro
---
import Layout from '~/layouts/PageLayout.astro';
import SchemaOrg from '~/components/common/SchemaOrg.astro';
import ContactForm from '~/components/ui/forms/ContactForm.astro';
import { Icon } from 'astro-icon/components';
import { SITE_NAME, SITE_URL, BOOKING_URL, SUPPORT_EMAIL } from '~/site';

const metadata = {
  title: 'Contact',
  description:
    'Talk to the SimpleRosterAI team. Tell us about your hospital and how you roster today, and we will reply within one working day with a demo slot and a rollout plan.',
};

const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Contact ${SITE_NAME}`,
  description: metadata.description,
  url: `${SITE_URL}/contact`,
  mainEntity: { '@id': `${SITE_URL}/#organization` },
};
---

<Layout metadata={metadata}>
  <SchemaOrg slot="head" schema={[contactPageSchema]} />
  <section class="bg-page">
    <div class="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
      <div class="mb-10">
        <p class="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Talk to us</p>
        <h1 class="text-4xl font-bold text-default mb-3">Contact</h1>
        <p class="text-lg text-muted max-w-2xl">{metadata.description}</p>
      </div>
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <div class="rounded-2xl border border-hairline bg-white p-6 sm:p-8">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">Book a demo on your own roster</h2>
            <p class="mt-2 text-default">
              Tell us the wards, the bed count and how the duty roster is built today. We reply within one working day
              with a demo slot. If we are not a fit, we will say so quickly.
            </p>
          </div>
          <ContactForm />
          <p class="mt-4 text-sm text-muted">No spam. No IT project. Your current Excel roster is enough to start.</p>
        </div>

        <div class="lg:pl-6">
          <h2 class="text-xl font-semibold">Contact details</h2>
          <p class="mt-2 text-default">Prefer email? Send a sample roster or a description of your rules.</p>
          <div class="mt-6 space-y-5">
            <div class="flex gap-x-4">
              <Icon name="tabler:calendar" class="mt-0.5 w-6 h-6 shrink-0 text-primary" />
              <div class="grow">
                <p class="font-semibold">Book a demo</p>
                <a
                  class="text-sm text-default underline decoration-gray-300 underline-offset-4 transition-colors hover:text-primary"
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer">Pick a 30-minute slot with our team</a
                >
              </div>
            </div>
            <div class="flex gap-x-4">
              <Icon name="tabler:mail" class="mt-0.5 w-6 h-6 shrink-0 text-primary" />
              <div class="grow">
                <p class="font-semibold">Email</p>
                <a
                  class="text-sm text-default underline decoration-gray-300 underline-offset-4 transition-colors hover:text-primary"
                  href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a
                >
              </div>
            </div>
          </div>
          <div class="mt-8 border-t border-hairline pt-6">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">What to include in your message</p>
            <ul class="mt-4 space-y-2">
              {
                [
                  'Bed count, number of wards and nursing headcount',
                  'Shift pattern (three 8-hour shifts, 12-hour, or mixed)',
                  'How the duty roster is built today (Excel, paper, HRMS module)',
                  'The rules that hurt most: 48-hour weeks, night rotation, weekly offs, leave clashes',
                ].map((item) => (
                  <li class="flex items-start gap-3">
                    <span class="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-primary" />
                    <span class="text-sm text-default">{item}</span>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <script is:inline>
    document.addEventListener('astro:page-load', () => {
      const textarea = document.querySelector('#input-message');
      if (!textarea) return;
      const resize = (offsetTop = 0) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + offsetTop}px`;
      };
      resize(3);
      textarea.addEventListener('input', () => resize(3));
    });
  </script>
</Layout>
```

- [ ] **Step 5: Write src/pages/privacy.astro**

```astro
---
import Layout from '~/layouts/PageLayout.astro';
import DarkHero from '~/components/widgets/DarkHero.astro';
import { SITE_NAME, SUPPORT_EMAIL, LEGAL_ENTITY_NAME, LEGAL_ADDRESS } from '~/site';

const metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE_NAME} collects, uses and protects the information you share with us.`,
};
const effectiveDate = '2 September 2026';

const sections = [
  {
    h: 'Overview',
    p: [
      `${SITE_NAME} is operated by ${LEGAL_ENTITY_NAME} ("we", "us"). We provide AI nurse duty rostering software to hospitals in India. This policy describes what personal data we collect through simplerosterai.com, why, and how we handle it. It is written to meet the Digital Personal Data Protection Act, 2023.`,
    ],
  },
  {
    h: 'What we collect',
    p: ['We collect information you give us directly when you:'],
    list: [
      'Submit the contact form or book a demo (name, role, hospital, work email, message)',
      'Use the cost calculator and choose to reveal your result (name, role, hospital, work email, and the slider values you entered)',
      'Use the interactive demo and leave your email',
      'Email us',
    ],
    after:
      'We also collect standard technical data automatically (browser type, pages visited, approximate location), used only in aggregate to understand how the site is used.',
  },
  {
    h: 'What we do not collect',
    p: [
      'This website does not collect, process or store patient records or any clinical data. The website handles enquiry data only. Data processed inside the product for a hospital customer is governed by that customer agreement, not this page.',
    ],
  },
  {
    h: 'How we use it',
    list: [
      'To reply to your enquiry and schedule a demo',
      'To assess whether the product fits your hospital',
      'To send product updates you can opt out of at any time',
      'To improve how we explain the product',
    ],
    after: 'We do not sell personal data, rent it, or share it with advertisers.',
  },
  {
    h: 'Third-party services',
    p: [
      'Form submissions are stored in a spreadsheet we control, via a hosted form endpoint. Our analytics tools receive aggregate traffic data only. Each provider processes data under its own privacy policy.',
    ],
  },
  {
    h: 'Retention',
    p: [
      'We keep enquiry data for as long as the conversation or customer relationship is active. Ask us to delete it and we will do so within 30 days unless the law requires us to keep it.',
    ],
  },
  {
    h: 'Your rights',
    p: [
      `Under the Digital Personal Data Protection Act, 2023 you may request access to, correction of, or erasure of your personal data, and you may withdraw consent. Write to ${SUPPORT_EMAIL}. Our grievance officer can be reached at the same address and will respond within the statutory period.`,
    ],
  },
  {
    h: 'Security',
    p: [
      'We take reasonable technical and organisational measures to protect the data you share. No internet transmission is fully secure, so please do not send patient or clinical information through this website.',
    ],
  },
  {
    h: 'Changes',
    p: ['Material changes to this policy will be reflected in the effective date above.'],
  },
];
---

<Layout metadata={metadata}>
  <DarkHero badge="Legal" title="Privacy Policy" subtitle={metadata.description} />
  <section class="bg-page">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <p class="text-sm text-muted mb-10">Effective date: {effectiveDate}</p>
      <div class="mx-auto max-w-3xl space-y-10 text-default">
        {
          sections.map((s) => (
            <div>
              <h2 class="text-xl font-semibold">{s.h}</h2>
              {s.p?.map((t) => <p class="mt-3 leading-relaxed">{t}</p>)}
              {s.list && (
                <ul class="mt-4 space-y-2">
                  {s.list.map((item) => (
                    <li class="flex items-start gap-3">
                      <span class="mt-2 w-1.5 h-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.after && <p class="mt-4 leading-relaxed">{s.after}</p>}
            </div>
          ))
        }
      </div>
    </div>
  </section>
  <section class="bg-ink">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl">
        <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-sage">Contact</p>
        <h2 class="text-2xl font-bold text-white">Questions about this policy?</h2>
        <p class="mt-6 text-lg font-medium text-sage"><a href="/contact">Contact us</a></p>
        <p class="mt-2 text-sm text-gray-500">{LEGAL_ENTITY_NAME}, {LEGAL_ADDRESS}</p>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 6: Write src/pages/terms.astro**

Same structure as privacy (copy the file, change the `sections` array, title, and metadata). Use:

```ts
const metadata = {
  title: 'Terms of Service',
  description: `The terms that govern your use of simplerosterai.com and the ${SITE_NAME} product.`,
};
const effectiveDate = '2 September 2026';

const sections = [
  {
    h: 'Agreement to these terms',
    p: [
      `By using simplerosterai.com or subscribing to ${SITE_NAME}, you agree to these terms. If you act on behalf of a hospital or group, you confirm you have authority to bind that organisation.`,
    ],
  },
  {
    h: 'What the product is',
    p: [
      `${SITE_NAME} is web-based nurse duty rostering software operated by ${LEGAL_ENTITY_NAME}. The engine builds draft rosters from the staff list, ward rules and leave you enter; your nursing office reviews and approves every roster before it is published. We are not a staffing provider, a healthcare provider or an HR system, and we never publish a roster without your approval.`,
    ],
  },
  {
    h: 'Subscription',
    list: [
      `Pricing is per nurse on the roster: ₹${PRICE_MONTHLY_INR} per nurse per month, or ₹${PRICE_ANNUAL_INR.toLocaleString('en-IN')} per nurse per year, plus GST. Supervisors, in-charges and the CNO are not billed.`,
      'Nurses are added or removed as your roster changes; billing follows the nurse count at each billing date.',
      'Monthly plans can be cancelled at any time and end at the close of the paid month. Annual plans run for twelve months.',
      'Hospital groups are quoted separately under a written agreement that takes precedence over these terms.',
    ],
  },
  {
    h: 'Your responsibilities',
    list: [
      'Provide accurate staff, rule and leave inputs',
      'Review every draft roster before it is used on the floor',
      'Comply with applicable labour law, licensing rules, accreditation standards and your own hospital policies',
      'Keep account credentials confidential',
    ],
  },
  {
    h: 'Not medical, legal or HR advice',
    p: [
      'Draft rosters are operational tools. Your nursing and administrative leadership remain responsible for patient safety, staffing norms and regulatory compliance.',
    ],
  },
  {
    h: 'Patient data',
    p: [
      'Do not enter patient records or clinical data into the product or this website. The product is scoped to nurse rostering data only.',
    ],
  },
  {
    h: 'Intellectual property',
    p: [
      `The website, product, copy and design are owned by ${LEGAL_ENTITY_NAME}. Rosters produced for your hospital are yours to use for internal purposes.`,
    ],
  },
  {
    h: 'Limitation of liability',
    p: [
      'We are not liable for rostering errors caused by inaccurate inputs, unreviewed drafts or decisions made outside the product. Our total liability is limited to the subscription fees paid in the preceding three months.',
    ],
  },
  {
    h: 'No warranties',
    p: [
      'The website and product are provided as is. We do not guarantee uninterrupted availability or specific rostering outcomes.',
    ],
  },
  {
    h: 'Governing law',
    p: ['These terms are governed by the laws of India. Courts at the registered office of the operator have exclusive jurisdiction.'],
  },
  {
    h: 'Changes',
    p: ['We may update these terms as the product evolves. Continued use after a change is acceptance of the revised terms.'],
  },
];
```

Import `PRICE_MONTHLY_INR, PRICE_ANNUAL_INR` alongside the other `~/site` imports.

- [ ] **Step 7: Verify**

```bash
npm run fix && npm run check && npm run build
```
Expected: exit 0. `dist/contact/index.html`, `dist/privacy/index.html`, `dist/terms/index.html` exist. Placeholder script warns about `TODO_BOOKING_URL`, `TODO_SUPPORT_EMAIL`, `TODO_LEAD_CAPTURE_URL`, `TODO_LEGAL_ENTITY_NAME`, `TODO_LEGAL_ADDRESS` (expected).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: shell widgets, contact, privacy and terms pages

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Rostering engine for three 8-hour shifts (TDD)

**Files:**
- Create: `src/components/demo-scheduler/engine.ts`
- Test: `src/components/demo-scheduler/engine.test.ts`

**Interfaces:**
- Produces (consumed by Task 4's Svelte component):
  - types `ShiftType = 'morning' | 'evening' | 'night'`, `DayIndex = 0..6`, `Role = 'SN' | 'NA'`, `Employment = 'full-time' | 'contract'`, `SlotKind = 'incharge' | 'sn' | 'na'`, `RuleId`, `Nurse`, `ShiftDef`, `Assignment`, `Schedule`, `Violation`, `Candidate`, `Dataset`
  - consts `DAY_NAMES`, `SHIFT_TYPES: readonly ShiftType[]`, `SHIFT_LABEL: Record<ShiftType, string>`, `SHIFT_WINDOW_LABEL: Record<ShiftType, string>`, `SHIFT_HOURS = 8`, `MAX_WEEK_HOURS = 48`, `MIN_REST_HOURS = 12`, `MAX_CONSECUTIVE_DAYS = 6`, `SEED`, `NURSES`, `SHIFTS`, `DATASET`
  - functions `designation(nurse)`, `shiftWindow(day, type)`, `restGapHours(a, b)`, `longestConsecutiveRun(days)`, `nurseHoursInWeek(schedule, nurseId)`, `roleFits(nurse, kind)`, `neededSlotKind(schedule, def, ds?)`, `placementViolations(schedule, cand, ds?)`, `checkSchedule(schedule, ds?)`, `eligibleCandidates(schedule, slot, kind, ds?, seed?)`, `generateSchedule(seed?, ds?)`

- [ ] **Step 1: Write the failing tests**

`src/components/demo-scheduler/engine.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DATASET,
  NURSES,
  SHIFTS,
  checkSchedule,
  eligibleCandidates,
  generateSchedule,
  neededSlotKind,
  placementViolations,
  restGapHours,
  type Assignment,
} from './engine.ts';

const byId = (id: string) => NURSES.find((n) => n.id === id)!;
const staffNurse = NURSES.find((n) => n.role === 'SN' && !n.inChargeQualified && n.employment === 'full-time' && !n.leaveDays)!;
const inCharge = NURSES.find((n) => n.inChargeQualified)!;
const assistant = NURSES.find((n) => n.role === 'NA')!;
const contract = NURSES.find((n) => n.employment === 'contract')!;
const onLeave = NURSES.find((n) => n.leaveDays && n.leaveDays.length > 0)!;

test('roster shape: 17 staff, 13 staff nurses, 5 in-charge qualified, 4 assistants', () => {
  assert.equal(NURSES.length, 17);
  assert.equal(NURSES.filter((n) => n.role === 'SN').length, 13);
  assert.equal(NURSES.filter((n) => n.inChargeQualified).length, 5);
  assert.equal(NURSES.filter((n) => n.role === 'NA').length, 4);
  assert.equal(SHIFTS.length, 21);
});

test('generateSchedule fills every seat with zero violations and is deterministic', () => {
  const s = generateSchedule();
  for (const def of SHIFTS) assert.equal(neededSlotKind(s, def, DATASET), null, `open seat on day ${def.day} ${def.type}`);
  assert.deepEqual(checkSchedule(s), []);
  assert.deepEqual(generateSchedule(), s);
});

test('rest: evening into next-morning gives 8h and breaks the 12h rule', () => {
  const a: Assignment = { nurseId: staffNurse.id, day: 0, type: 'evening' };
  const b: Assignment = { nurseId: staffNurse.id, day: 1, type: 'morning' };
  assert.equal(restGapHours(a, b), 8);
  const v = placementViolations([a], b);
  assert.ok(v.some((x) => x.rule === 'rest12h'), JSON.stringify(v));
  assert.ok(v.find((x) => x.rule === 'rest12h')!.message.includes('evening-into-morning'));
});

test('rest: morning then evening next day is a clean 24h gap', () => {
  const a: Assignment = { nurseId: staffNurse.id, day: 0, type: 'morning' };
  const b: Assignment = { nurseId: staffNurse.id, day: 1, type: 'evening' };
  assert.equal(restGapHours(a, b), 24);
  assert.deepEqual(placementViolations([a], b), []);
});

test('same-day double shift is blocked by rest, and overlapping is noOverlap', () => {
  const a: Assignment = { nurseId: staffNurse.id, day: 2, type: 'morning' };
  assert.ok(placementViolations([a], { ...a, type: 'evening' }).some((v) => v.rule === 'rest12h'));
  assert.ok(placementViolations([a], { ...a }).some((v) => v.rule === 'noOverlap'));
});

test('48-hour cap, weekly off and 6-day limit all fire on a seventh day', () => {
  const six: Assignment[] = [0, 1, 2, 3, 4, 5].map((d) => ({ nurseId: staffNurse.id, day: d as 0, type: 'morning' }));
  assert.deepEqual(placementViolations(six.slice(0, 5), six[5]!), []);
  const rules = placementViolations(six, { nurseId: staffNurse.id, day: 6, type: 'morning' }).map((v) => v.rule);
  assert.ok(rules.includes('maxHours48'), rules.join());
  assert.ok(rules.includes('weeklyOff'), rules.join());
  assert.ok(rules.includes('maxConsecutive6'), rules.join());
});

test('weekly off fires on 7 distinct days even when the run is broken', () => {
  const days = [0, 1, 2, 3, 4, 6];
  const six: Assignment[] = days.map((d) => ({ nurseId: staffNurse.id, day: d as 0, type: 'night' }));
  const rules = placementViolations(six, { nurseId: staffNurse.id, day: 5, type: 'night' }).map((v) => v.rule);
  assert.ok(rules.includes('weeklyOff'));
});

test('role fit: an assistant cannot take the in-charge or staff-nurse seat, a nurse cannot take the assistant seat', () => {
  const slot = { day: 0 as const, type: 'morning' as const };
  const forIC = eligibleCandidates([], slot, 'incharge');
  assert.ok(!forIC.find((c) => c.nurse.id === assistant.id)!.eligible);
  assert.ok(!forIC.find((c) => c.nurse.id === staffNurse.id)!.eligible);
  assert.ok(forIC.find((c) => c.nurse.id === inCharge.id)!.eligible);
  const forNA = eligibleCandidates([], slot, 'na');
  assert.ok(!forNA.find((c) => c.nurse.id === inCharge.id)!.eligible);
  assert.ok(forNA.find((c) => c.nurse.id === assistant.id)!.eligible);
});

test('approved leave and contract availability are enforced', () => {
  const leaveDay = onLeave.leaveDays![0]!;
  assert.ok(placementViolations([], { nurseId: onLeave.id, day: leaveDay, type: 'morning' }).some((v) => v.rule === 'approvedLeave'));
  const offDay = ([0, 1, 2, 3, 4, 5, 6] as const).find((d) => !contract.contractAvailableDays!.includes(d))!;
  assert.ok(
    placementViolations([], { nurseId: contract.id, day: offDay, type: 'morning' }).some((v) => v.rule === 'contractAvailability')
  );
  assert.ok(byId(contract.id).contractAvailableDays!.length > 0);
});

test('eligible candidates are sorted eligible-first with a positive reason list', () => {
  const s = generateSchedule();
  const def = SHIFTS[0]!;
  const removed = s.filter((a) => !(a.day === def.day && a.type === def.type && byId(a.nurseId).role === 'NA'));
  const list = eligibleCandidates(removed, def, 'na');
  const firstIneligible = list.findIndex((c) => !c.eligible);
  const lastEligible = list.map((c) => c.eligible).lastIndexOf(true);
  assert.ok(firstIneligible === -1 || lastEligible < firstIneligible);
  assert.ok(list.find((c) => c.eligible)!.reasons.length >= 2);
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npm test`
Expected: FAIL with `Cannot find module './engine.ts'`.

- [ ] **Step 3: Write src/components/demo-scheduler/engine.ts**

```ts
/**
 * SimpleRosterAI — interactive demo rostering engine.
 *
 * Pure, dependency-free, deterministic. No DOM, no network, no randomness beyond
 * a fixed seed. Models one ward of an Indian hospital on three 8-hour shifts
 * (morning 07:00–15:00, evening 15:00–23:00, night 23:00–07:00) with the rules a
 * CNO actually enforces: an in-charge on every shift, the right skill mix,
 * 12 hours rest, a 48-hour week, one weekly off, no seventh consecutive day.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type ShiftType = 'morning' | 'evening' | 'night';
/** 0 = Monday … 6 = Sunday */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Employment = 'full-time' | 'contract';
/** SN = Staff Nurse (GNM/BSc), NA = Nursing Assistant */
export type Role = 'SN' | 'NA';
/** The kind of seat on a shift: the in-charge, a staff nurse, or a nursing assistant. */
export type SlotKind = 'incharge' | 'sn' | 'na';

export interface Nurse {
  id: string;
  name: string;
  role: Role;
  /** senior staff nurses only: may hold the in-charge seat */
  inChargeQualified: boolean;
  employment: Employment;
  /** approved-leave day indices (never rostered on these) */
  leaveDays?: DayIndex[];
  /** for contract staff: the only day indices they are available */
  contractAvailableDays?: DayIndex[];
}

export interface ShiftDef {
  day: DayIndex;
  type: ShiftType;
  /** in-charge seats (always 1) */
  incharge: number;
  /** additional staff-nurse seats */
  sn: number;
  /** nursing-assistant seats */
  na: number;
  /** total headcount = incharge + sn + na */
  required: number;
}

export interface Assignment {
  nurseId: string;
  day: DayIndex;
  type: ShiftType;
}

export type Schedule = Assignment[];

export type RuleId =
  | 'rest12h'
  | 'maxConsecutive6'
  | 'maxHours48'
  | 'weeklyOff'
  | 'noOverlap'
  | 'inchargeCoverage'
  | 'snCoverage'
  | 'naCoverage'
  | 'approvedLeave'
  | 'contractAvailability';

export interface Violation {
  rule: RuleId;
  nurseId?: string;
  day?: DayIndex;
  type?: ShiftType;
  /** plain-English, visitor-facing explanation */
  message: string;
}

export interface Candidate {
  nurse: Nurse;
  eligible: boolean;
  already: boolean;
  violations: Violation[];
  reasons: string[];
  score: number;
}

export interface Dataset {
  nurses: Nurse[];
  shifts: ShiftDef[];
}

// ── Constants and fixed, fictional dataset ──────────────────────────────────

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const SHIFT_TYPES: readonly ShiftType[] = ['morning', 'evening', 'night'];
export const SHIFT_LABEL: Record<ShiftType, string> = { morning: 'Morning', evening: 'Evening', night: 'Night' };
export const SHIFT_WINDOW_LABEL: Record<ShiftType, string> = {
  morning: '07:00–15:00',
  evening: '15:00–23:00',
  night: '23:00–07:00',
};
export const SHIFT_HOURS = 8;
export const MAX_WEEK_HOURS = 48;
export const MIN_REST_HOURS = 12;
export const MAX_CONSECUTIVE_DAYS = 6;
export const SEED = 20260902;

function sn(id: string, name: string, inCharge = false, employment: Employment = 'full-time', extra: Partial<Nurse> = {}): Nurse {
  return { id, name, role: 'SN', inChargeQualified: inCharge, employment, ...extra };
}
function na(id: string, name: string): Nurse {
  return { id, name, role: 'NA', inChargeQualified: false, employment: 'full-time' };
}

export const NURSES: Nurse[] = [
  // Senior staff nurses, in-charge qualified (5)
  sn('n1', 'Anjali Menon', true),
  sn('n2', 'Priya Nair', true),
  sn('n3', 'Rekha Sharma', true),
  sn('n4', 'Joseph Thomas', true),
  sn('n5', 'Sunita Patil', true),
  // Staff nurses (8)
  sn('n6', 'Deepa Krishnan'),
  sn('n7', 'Meena Iyer'),
  sn('n8', 'Ritu Verma'),
  sn('n9', 'Arun Pillai'),
  sn('n10', 'Kavitha Reddy'),
  sn('n11', 'Sneha Joshi'),
  sn('n12', 'Lakshmi Das', false, 'contract', { contractAvailableDays: [5, 6] }), // contract: weekends only
  sn('n13', 'Neha Gupta', false, 'full-time', { leaveDays: [2, 3] }), // approved leave Wed–Thu
  // Nursing assistants (4)
  na('a1', 'Ramesh Kumar'),
  na('a2', 'Geeta Yadav'),
  na('a3', 'Suresh Babu'),
  na('a4', 'Pooja Singh'),
];

/**
 * Morning = 1 in-charge + 2 staff nurses + 1 assistant (4).
 * Evening = 1 in-charge + 2 staff nurses + 1 assistant (4).
 * Night   = 1 in-charge + 1 staff nurse  + 1 assistant (3).
 * 11 seats a day, 77 a week, staffed by 17 people on at most 6 duties each.
 */
function mkShift(day: DayIndex, type: ShiftType, incharge: number, snSeats: number, naSeats: number): ShiftDef {
  return { day, type, incharge, sn: snSeats, na: naSeats, required: incharge + snSeats + naSeats };
}
export const SHIFTS: ShiftDef[] = ([0, 1, 2, 3, 4, 5, 6] as DayIndex[]).flatMap((day) => [
  mkShift(day, 'morning', 1, 2, 1),
  mkShift(day, 'evening', 1, 2, 1),
  mkShift(day, 'night', 1, 1, 1),
]);

export const DATASET: Dataset = { nurses: NURSES, shifts: SHIFTS };

/** Display credential: Sr SN for in-charge qualified, SN, NA. */
export function designation(nurse: Nurse): string {
  if (nurse.role === 'NA') return 'NA';
  return nurse.inChargeQualified ? 'Sr SN' : 'SN';
}

// ── Time helpers (absolute hours from Monday 00:00) ─────────────────────────

const SHIFT_START: Record<ShiftType, number> = { morning: 7, evening: 15, night: 23 };

export function shiftWindow(day: DayIndex, type: ShiftType): { start: number; end: number } {
  const start = day * 24 + SHIFT_START[type];
  return { start, end: start + SHIFT_HOURS };
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Rest hours between two shifts. Returns -1 if they overlap. Touching shifts = 0h. */
export function restGapHours(a: Assignment, b: Assignment): number {
  const wa = shiftWindow(a.day, a.type);
  const wb = shiftWindow(b.day, b.type);
  if (overlaps(wa, wb)) return -1;
  return wa.end <= wb.start ? wb.start - wa.end : wa.start - wb.end;
}

export function longestConsecutiveRun(days: number[]): number {
  const uniq = [...new Set(days)].sort((x, y) => x - y);
  let best = 0;
  let run = 0;
  let prev = Number.NaN;
  for (const d of uniq) {
    run = d === prev + 1 ? run + 1 : 1;
    prev = d;
    if (run > best) best = run;
  }
  return best;
}

export function nurseHoursInWeek(schedule: Schedule, nurseId: string): number {
  return schedule.filter((a) => a.nurseId === nurseId).length * SHIFT_HOURS;
}

/** Max hours in any 7-consecutive-day window containing `pivotDay`. */
function maxRolling7Hours(workedDays: number[], pivotDay: number): number {
  let max = 0;
  for (let start = pivotDay - 6; start <= pivotDay; start++) {
    const count = workedDays.filter((d) => d >= start && d <= start + 6).length;
    max = Math.max(max, count * SHIFT_HOURS);
  }
  return max;
}

// ── Roles ───────────────────────────────────────────────────────────────────

export function roleFits(nurse: Nurse, kind: SlotKind): boolean {
  if (kind === 'incharge') return nurse.role === 'SN' && nurse.inChargeQualified;
  if (kind === 'sn') return nurse.role === 'SN';
  return nurse.role === 'NA';
}

function roleFitViolation(nurse: Nurse, kind: SlotKind, day: DayIndex, type: ShiftType): Violation | null {
  if (roleFits(nurse, kind)) return null;
  const at = { nurseId: nurse.id, day, type };
  if (kind === 'incharge') {
    const message =
      nurse.role !== 'SN'
        ? `${nurse.name} is a nursing assistant — the in-charge must be a senior staff nurse.`
        : `${nurse.name} is not in-charge qualified — this seat needs a senior staff nurse.`;
    return { rule: 'inchargeCoverage', ...at, message };
  }
  if (kind === 'sn') {
    return { rule: 'snCoverage', ...at, message: `${nurse.name} is a nursing assistant — this is a staff-nurse seat.` };
  }
  return { rule: 'naCoverage', ...at, message: `${nurse.name} is a staff nurse — this seat is for a nursing assistant.` };
}

function countOnShift(schedule: Schedule, day: DayIndex, type: ShiftType, ds: Dataset) {
  const here = schedule.filter((a) => a.day === day && a.type === type);
  let incharge = 0;
  let snCount = 0;
  let naCount = 0;
  for (const a of here) {
    const n = ds.nurses.find((nn) => nn.id === a.nurseId);
    if (!n) continue;
    if (n.role === 'SN') {
      snCount += 1;
      if (n.inChargeQualified) incharge += 1;
    } else {
      naCount += 1;
    }
  }
  return { incharge, sn: snCount, na: naCount, total: here.length };
}

/** The next unfilled seat kind on a shift (incharge → sn → na), or null when fully staffed. */
export function neededSlotKind(schedule: Schedule, def: ShiftDef, ds: Dataset = DATASET): SlotKind | null {
  const c = countOnShift(schedule, def.day, def.type, ds);
  if (c.incharge < def.incharge) return 'incharge';
  if (c.sn < def.incharge + def.sn) return 'sn';
  if (c.na < def.na) return 'na';
  return null;
}

// ── Hard rules — placement-level ────────────────────────────────────────────

export function placementViolations(schedule: Schedule, cand: Assignment, ds: Dataset = DATASET): Violation[] {
  const v: Violation[] = [];
  const nurse = ds.nurses.find((n) => n.id === cand.nurseId);
  if (!nurse) return v;
  const name = nurse.name;
  const dayName = DAY_NAMES[cand.day];
  const at = { nurseId: nurse.id, day: cand.day, type: cand.type };

  if (nurse.leaveDays?.includes(cand.day)) {
    v.push({ rule: 'approvedLeave', ...at, message: `${name} is on approved leave on ${dayName}.` });
  }
  if (nurse.employment === 'contract' && !(nurse.contractAvailableDays ?? []).includes(cand.day)) {
    v.push({ rule: 'contractAvailability', ...at, message: `${name} is a contract nurse and is not available on ${dayName}.` });
  }

  const others = schedule.filter((a) => a.nurseId === cand.nurseId);
  let overlapFlagged = false;
  let restFlagged = false;
  for (const o of others) {
    const gap = restGapHours(o, cand);
    if (gap < 0 && !overlapFlagged) {
      v.push({ rule: 'noOverlap', ...at, message: `${name} is already on another shift at that time.` });
      overlapFlagged = true;
    } else if (gap >= 0 && gap < MIN_REST_HOURS && !restFlagged) {
      const earlier = shiftWindow(o.day, o.type).start < shiftWindow(cand.day, cand.type).start ? o : cand;
      const later = earlier === o ? cand : o;
      const turnaround = earlier.type === 'evening' && later.type === 'morning' && later.day === earlier.day + 1;
      v.push({
        rule: 'rest12h',
        ...at,
        message: turnaround
          ? `${name} would do an evening-into-morning turnaround — only ${gap}h rest, under the 12-hour minimum.`
          : `${name} would get only ${gap}h rest between shifts — under the 12-hour minimum.`,
      });
      restFlagged = true;
    }
  }

  const workedDays = [...others.map((o) => o.day), cand.day];
  const run = longestConsecutiveRun(workedDays);
  if (run > MAX_CONSECUTIVE_DAYS) {
    v.push({
      rule: 'maxConsecutive6',
      ...at,
      message: `${name} would be on duty ${run} days in a row — over the ${MAX_CONSECUTIVE_DAYS}-day limit.`,
    });
  }

  const hours = maxRolling7Hours(workedDays, cand.day);
  if (hours > MAX_WEEK_HOURS) {
    v.push({ rule: 'maxHours48', ...at, message: `${name} would reach ${hours}h this week — over the 48-hour limit.` });
  }

  if (new Set(workedDays).size > 6) {
    v.push({ rule: 'weeklyOff', ...at, message: `${name} would have no weekly off — every nurse gets one day off in seven.` });
  }

  return v;
}

// ── Whole-schedule validation ───────────────────────────────────────────────

export function checkSchedule(schedule: Schedule, ds: Dataset = DATASET): Violation[] {
  const out: Violation[] = [];
  for (const asg of schedule) {
    const rest = schedule.filter((x) => x !== asg);
    out.push(...placementViolations(rest, asg, ds));
  }
  for (const shift of ds.shifts) {
    const c = countOnShift(schedule, shift.day, shift.type, ds);
    const where = `${DAY_NAMES[shift.day]} ${shift.type} shift`;
    if (c.incharge < shift.incharge) {
      out.push({ rule: 'inchargeCoverage', day: shift.day, type: shift.type, message: `${where} has no in-charge — every shift needs a senior staff nurse in charge.` });
    }
    if (c.sn < shift.incharge + shift.sn) {
      out.push({ rule: 'snCoverage', day: shift.day, type: shift.type, message: `${where} is short ${shift.incharge + shift.sn - c.sn} staff nurse(s).` });
    }
    if (c.na < shift.na) {
      out.push({ rule: 'naCoverage', day: shift.day, type: shift.type, message: `${where} needs a nursing assistant.` });
    }
  }
  return out;
}

// ── Soft preferences + deterministic jitter ─────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function jitterFor(nurseId: string, seed: number): number {
  return mulberry32((seed ^ hashStr(nurseId)) >>> 0)();
}

const isWeekendDay = (d: number): boolean => d === 5 || d === 6;

function scoreFor(nurse: Nurse, schedule: Schedule, slot: { day: DayIndex; type: ShiftType }, seed: number): number {
  const hours = nurseHoursInWeek(schedule, nurse.id);
  let s = 1000 - hours * 5;
  const worksDay = (d: number) => schedule.some((a) => a.nurseId === nurse.id && a.day === d);
  if (worksDay(slot.day - 1) || worksDay(slot.day + 1)) s -= 8;
  if (isWeekendDay(slot.day) && schedule.some((a) => a.nurseId === nurse.id && isWeekendDay(a.day))) s -= 15;
  if (slot.type === 'night' && schedule.some((a) => a.nurseId === nurse.id && a.type === 'night')) s -= 12; // night rotation fairness
  s += jitterFor(nurse.id, seed) * 4;
  return s;
}

function positiveReasons(nurse: Nurse, schedule: Schedule, slot: { day: DayIndex; type: ShiftType }): string[] {
  const hours = nurseHoursInWeek(schedule, nurse.id);
  const reasons: string[] = [designation(nurse)];
  if (nurse.inChargeQualified) reasons.push('in-charge qualified');
  reasons.push(`${hours}h so far this week`);
  const others = schedule.filter((a) => a.nurseId === nurse.id);
  if (others.length) {
    const gaps = others.map((o) => restGapHours(o, { nurseId: nurse.id, day: slot.day, type: slot.type })).filter((g) => g >= 0);
    if (gaps.length) reasons.push(`${Math.min(...gaps)}h rest ✓`);
  }
  return reasons;
}

// ── The picker ──────────────────────────────────────────────────────────────

export function eligibleCandidates(
  schedule: Schedule,
  slot: { day: DayIndex; type: ShiftType },
  kind: SlotKind,
  ds: Dataset = DATASET,
  seed: number = SEED
): Candidate[] {
  const onShift = new Set(schedule.filter((a) => a.day === slot.day && a.type === slot.type).map((a) => a.nurseId));
  const list: Candidate[] = ds.nurses.map((nurse) => {
    const already = onShift.has(nurse.id);
    const cand: Assignment = { nurseId: nurse.id, day: slot.day, type: slot.type };
    let violations: Violation[] = [];
    if (!already) {
      const rf = roleFitViolation(nurse, kind, slot.day, slot.type);
      violations = [...(rf ? [rf] : []), ...placementViolations(schedule, cand, ds)];
    }
    const eligible = !already && violations.length === 0;
    return {
      nurse,
      eligible,
      already,
      violations,
      reasons: eligible ? positiveReasons(nurse, schedule, slot) : [],
      score: scoreFor(nurse, schedule, slot, seed),
    };
  });
  list.sort((x, y) => {
    if (x.eligible !== y.eligible) return x.eligible ? -1 : 1;
    if (y.score !== x.score) return y.score - x.score;
    return x.nurse.id < y.nurse.id ? -1 : 1;
  });
  return list;
}

// ── Deterministic generation ────────────────────────────────────────────────

export function generateSchedule(seed: number = SEED, ds: Dataset = DATASET): Schedule {
  const schedule: Schedule = [];
  const onShift = (day: DayIndex, type: ShiftType) =>
    new Set(schedule.filter((a) => a.day === day && a.type === type).map((a) => a.nurseId));

  for (const shift of ds.shifts) {
    const kinds: SlotKind[] = ['incharge', 'sn', 'na'];
    for (const kind of kinds) {
      const target = kind === 'incharge' ? shift.incharge : kind === 'sn' ? shift.incharge + shift.sn : shift.na;
      for (;;) {
        const c = countOnShift(schedule, shift.day, shift.type, ds);
        const have = kind === 'incharge' ? c.incharge : kind === 'sn' ? c.sn : c.na;
        if (have >= target) break;
        const here = onShift(shift.day, shift.type);
        let cands = eligibleCandidates(schedule, shift, kind, ds, seed).filter((cd) => cd.eligible && !here.has(cd.nurse.id));
        if (kind === 'sn') {
          // Prefer non-in-charge nurses for staff seats to preserve scarce in-charge capacity.
          cands = cands.sort((x, y) => {
            const cx = x.nurse.inChargeQualified ? 1 : 0;
            const cy = y.nurse.inChargeQualified ? 1 : 0;
            if (cx !== cy) return cx - cy;
            if (y.score !== x.score) return y.score - x.score;
            return x.nurse.id < y.nurse.id ? -1 : 1;
          });
        }
        if (cands.length === 0) break;
        schedule.push({ nurseId: cands[0]!.nurse.id, day: shift.day, type: shift.type });
      }
    }
  }
  return schedule;
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: all 10 tests PASS.

If `generateSchedule fills every seat` fails because the greedy fill leaves a seat open (the dataset is deliberately tight), do exactly one of these, re-run, and record which in the commit message: (a) change the Sunday shift set only, so `mkShift(6, 'evening', 1, 1, 1)`; or (b) add `sn('n14', 'Farida Khan')` to the staff nurses and change the shape test to 18 staff, 14 staff nurses. Do not weaken the rules.

- [ ] **Step 5: Lint and commit**

```bash
npm run fix && npm run check:eslint
git add src/components/demo-scheduler
git commit -m "feat(demo): rostering engine for three 8-hour shifts with Indian rules

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Interactive demo component and /demo page

**Files:**
- Create: `src/components/demo-scheduler/DemoScheduler.svelte` (start from a copy of `$SRC/src/components/demo-scheduler/DemoScheduler.svelte`, then apply every edit below)
- Create: `src/pages/demo.astro`

**Interfaces:**
- Consumes every export of `engine.ts` from Task 3 and `BOOKING_URL`, `LEAD_CAPTURE_URL` from `src/site.ts`.
- Produces `<DemoScheduler client:visible />` with no props.

- [ ] **Step 1: Copy the source component**

```bash
cp "$SRC/src/components/demo-scheduler/DemoScheduler.svelte" src/components/demo-scheduler/
```

- [ ] **Step 2: Script-block edits (apply each exactly)**

1. Header comment: replace the source brand name's "interactive 'try it yourself' scheduler demo." line with `SimpleRosterAI — interactive "try it yourself" duty roster demo.` and `"Demo data, not a real hospital."` stays.

2. Imports: add `SHIFT_TYPES, SHIFT_LABEL, SHIFT_WINDOW_LABEL, MAX_WEEK_HOURS, designation,` to the engine import list. Add a new line after it: `import { BOOKING_URL, LEAD_CAPTURE_URL } from '~/site';`

3. Replace the `CONFIG` object with:
```ts
const CONFIG = { calUrl: BOOKING_URL, captureUrl: LEAD_CAPTURE_URL };
```

4. Replace `COVERAGE_RULES` and `CHECKLIST` with:
```ts
const COVERAGE_RULES = new Set(['inchargeCoverage', 'snCoverage', 'naCoverage']);
const CHECKLIST = [
  { label: '12-hour rest between duties', rules: ['rest12h'] },
  { label: 'One weekly off, no 7th day in a row', rules: ['weeklyOff', 'maxConsecutive6'] },
  { label: 'In-charge on every shift', rules: ['inchargeCoverage'] },
  { label: 'Right skill mix (staff nurses + assistants)', rules: ['snCoverage', 'naCoverage'] },
  { label: 'Under 48 hours per nurse', rules: ['maxHours48'] },
  { label: 'Approved leave respected', rules: ['approvedLeave'] },
];
```

5. In `coverageSummary`, replace the three `return` lines after `const where = ...` with:
```ts
if (coverageGaps.some((x) => x.rule === 'inchargeCoverage'))
  return `${where} still needs an in-charge — only a senior staff nurse can hold the in-charge seat.`;
if (coverageGaps.some((x) => x.rule === 'snCoverage'))
  return `${where} still needs another staff nurse — an assistant cannot fill a nursing seat.`;
return `${where} still needs a nursing assistant.`;
```

6. Replace `const isCharge = (id: string) => nurseById(id).chargeQualified;` with `const isInCharge = (id: string) => nurseById(id).inChargeQualified;` and every other `isCharge(` in the file with `isInCharge(`.

7. Replace `seatLabel` with:
```ts
const seatLabel = (k: SlotKind) => (k === 'incharge' ? 'in-charge' : k === 'sn' ? 'staff nurse' : 'nursing assistant');
```

8. Replace `roleTone` with:
```ts
function roleTone(nurse: Nurse): string {
  if (nurse.inChargeQualified) return 'tone-charge';
  if (nurse.role === 'NA') return 'tone-cna';
  return 'tone-rn';
}
```

9. In `track`, change `demo: 'nurse-scheduler'` to `demo: 'nurse-roster'`.

10. In `cellOf`, replace the `needLabel` line with:
```ts
const needLabel = need === 'incharge' ? 'needs in-charge' : need === 'sn' ? 'needs staff nurse' : need === 'na' ? 'needs assistant' : '';
```

11. Replace the whole `tryToBreak` function with:
```ts
  // ── 2. TRY TO BREAK IT — stack a staff nurse onto six mornings straight (the legal
  //      max: 48h, six days), then show the seventh day being blocked. ──────────
  function tryToBreak() {
    const block: DayIndex[] = [0, 1, 2, 3, 4, 5]; // Mon–Sat
    const seventh: DayIndex = 6; // Sunday
    const candidates = NURSES.filter((n) => n.role === 'SN' && !n.inChargeQualified && n.employment === 'full-time' && !n.leaveDays);
    for (const nurse of candidates) {
      let trial: Assignment[] = [...schedule];
      let ok = true;
      for (const d of block) {
        if (trial.some((a) => a.nurseId === nurse.id && a.day === d)) continue;
        const spare = trial.find((a) => {
          if (a.day !== d || a.type !== 'morning') return false;
          const n = nurseById(a.nurseId);
          return n.role === 'SN' && !n.inChargeQualified;
        });
        const base = spare ? trial.filter((a) => a !== spare) : trial;
        if (placementViolations(base, { nurseId: nurse.id, day: d, type: 'morning' }, DATASET).length === 0) {
          trial = [...base, { nurseId: nurse.id, day: d, type: 'morning' }];
        } else {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      const seventhViolations = placementViolations(trial, { nurseId: nurse.id, day: seventh, type: 'morning' }, DATASET);
      if (seventhViolations.some((v) => v.rule === 'weeklyOff')) {
        pushUndo();
        schedule = trial;
        track('demo_break_attempt', { nurse: nurse.name, rule_target: 'weeklyOff' });
        stressNote = `Stress test: we put ${nurse.name} on Mon–Sat mornings — six days straight, ${nurseHoursInWeek(schedule, nurse.id)}h (the weekly cap). Now try adding them on Sunday.`;
        picker = { day: seventh, type: 'morning', mode: 'breakit', kind: 'sn', highlightId: nurse.id };
        return;
      }
    }
    flash('Could not set up a stress test on this roster — try an absence instead.');
  }
```

12. Replace the three call-out functions with:
```ts
  // ── 3. ABSENCES — each leaves a role-specific gap the picker fills by skill. ──
  function callOut() {
    const day: DayIndex = 1;
    const type: ShiftType = 'morning';
    const here = schedule.filter((a) => a.day === day && a.type === type);
    const victim = here.find((a) => nurseById(a.nurseId).role === 'SN' && !isInCharge(a.nurseId)) ?? here[0];
    if (!victim) return;
    pushUndo();
    stressNote = null;
    schedule = schedule.filter((a) => a !== victim);
    track('demo_absence', { nurse: nurseById(victim.nurseId).name, role: 'sn' });
    picker = { day, type, mode: 'callout', kind: 'sn', calledOut: victim.nurseId };
  }
  function inChargeCallOut() {
    const day: DayIndex = 3;
    const type: ShiftType = 'night';
    const here = schedule.filter((a) => a.day === day && a.type === type);
    const victim = here.find((a) => isInCharge(a.nurseId));
    if (!victim) return;
    pushUndo();
    stressNote = null;
    schedule = schedule.filter((a) => a !== victim);
    track('demo_absence', { nurse: nurseById(victim.nurseId).name, role: 'incharge' });
    picker = { day, type, mode: 'callout', kind: 'incharge', calledOut: victim.nurseId };
  }
  function assistantCallOut() {
    const day: DayIndex = 4;
    const type: ShiftType = 'evening';
    const here = schedule.filter((a) => a.day === day && a.type === type);
    const victim = here.find((a) => nurseById(a.nurseId).role === 'NA');
    if (!victim) return;
    pushUndo();
    stressNote = null;
    schedule = schedule.filter((a) => a !== victim);
    track('demo_absence', { nurse: nurseById(victim.nurseId).name, role: 'na' });
    picker = { day, type, mode: 'callout', kind: 'na', calledOut: victim.nurseId };
  }
```

13. In `assign`, replace the `label` ternary with:
```ts
const label = stillNeeds === 'incharge' ? 'a senior staff nurse as in-charge' : stillNeeds === 'sn' ? 'another staff nurse' : 'a nursing assistant';
```
and the two `track('demo_callout_resolved'` calls become `track('demo_absence_resolved'`.

14. In `forceAnyway`, inside the `spare` finder replace `return n.role === 'RN' && !n.chargeQualified;` with `return n.role === 'SN' && !n.inChargeQualified;`.

15. In `openPicker`, change `?? 'rn'` to `?? 'sn'`.

16. In `submitEmail`, change `source: 'simulator-demo'` to `source: 'demo'` and the message to `'Wants to see the demo on their own roster (from /demo).'`.

- [ ] **Step 3: Markup edits**

1. Header block:
```svelte
<h2 id="ssa-demo-title">Build a safe ward week in under a minute.</h2>
<p class="ssa-sub">
  One ward, one week, 17 fictional staff — senior staff nurses, staff nurses and nursing assistants on three
  8-hour shifts. The same explainable rules the product enforces: every decision traceable, nothing hidden.
</p>
```

2. Team head: replace the `ssa-fair` spans with
```svelte
{#if phase === 'ready'}
  <span class="ssa-fair">
    Balanced: {fairness.min}–{fairness.max}h each · weekends across {fairness.weekendNurses} people · nobody over {MAX_WEEK_HOURS}h
  </span>
{:else}
  <span class="ssa-fair">17 staff — 13 staff nurses (5 in-charge qualified), 4 nursing assistants</span>
{/if}
```

3. Roster row: `{#if isInCharge(r.nurse.id)}<span class="ssa-shield" aria-label="in-charge qualified">⬢</span>{/if}`; `<span class="ssa-chip-lvl">{designation(r.nurse)}</span>`; badges become
```svelte
{#if r.nurse.inChargeQualified}<span class="ssa-badge2 charge">in-charge</span>{/if}
{#if r.nurse.role === 'NA'}<span class="ssa-badge2 cna">assistant</span>{/if}
{#if r.nurse.employment === 'contract'}<span class="ssa-badge2 prn">contract · weekends</span>{/if}
{#if r.nurse.leaveDays}<span class="ssa-badge2 leave">on leave {(r.nurse.leaveDays ?? []).map(dayShort).join('–')}</span>{/if}
```
and the bar width uses `(r.hours / MAX_WEEK_HOURS) * 100`.

4. Intro CTA hint: `Every seat below is empty. <strong>Click to start</strong> — one click rosters the whole week, safely.`

5. Action bar status: replace the nested ternary with `'needs an in-charge'`, `'needs a staff nurse'`, `'needs an assistant'` keyed on `inchargeCoverage` and `snCoverage`. Buttons:
```svelte
<button class="ssa-btn" onclick={callOut}>Staff nurse absent{#if guide === 'staffout'}<span class="ssa-cta-dot" aria-hidden="true"></span>{/if}</button>
<button class="ssa-btn" onclick={inChargeCallOut}>In-charge absent</button>
<button class="ssa-btn" onclick={assistantCallOut}>Assistant absent</button>
```

6. Grid: `aria-label="Ward weekly duty roster"`; column head becomes
```svelte
<div class="ssa-col-head" role="row" aria-hidden="true">
  <span></span>
  {#each SHIFT_TYPES as t}<span>{SHIFT_LABEL[t]} · {SHIFT_WINDOW_LABEL[t]}</span>{/each}
</div>
```
The cell loop becomes `{#each SHIFT_TYPES as type}` and inside it `<span class="ssa-cell-shift" aria-hidden="true">{SHIFT_LABEL[type]}</span>`, the chip shows `{designation(n)}`, and the shield title is `In-charge`.

7. Deliver section:
```svelte
<div class="ssa-deliver-item">
  <span class="ssa-deliver-icon" aria-hidden="true">⏳</span>
  <span><strong>The boring part of the week — handled.</strong> By hand, a roster like this takes a nursing supervisor hours every week, for every ward.</span>
</div>
<div class="ssa-deliver-item">
  <span class="ssa-deliver-icon" aria-hidden="true">📱</span>
  <span><strong>Every nurse sees it on their phone.</strong> Duties, leave, swaps and absences in one place. Your nursing office approves; nothing publishes without sign-off.</span>
</div>
```

8. Convert block: heading `That was one ward and one week. Your hospital is bigger — that is the point.`; paragraph `Book a demo and we will run this on one of your own wards.`; email placeholder `you@hospital.in`; role placeholder `Role (CNO, Nursing Superintendent…)`; submit button text `Show me on my roster`; book links `…or book a demo →` and `Book a demo →`; sent text `✓ Thanks — we will be in touch within one working day.`

9. Picker: title lines use `{nurseById(p.calledOut ?? '').name} is absent — find a {seatLabel(p.kind)}` and `{DAY_NAMES[p.day]} · {SHIFT_LABEL[p.type]} — fill the {seatLabel(p.kind)} seat`. Tips:
```svelte
{:else if p.kind === 'incharge'}
  <p class="ssa-tip">This is the <span class="ssa-shield">⬢</span> in-charge seat — only a senior staff nurse can take it.</p>
{:else if p.kind === 'sn'}
  <p class="ssa-tip">This is a staff-nurse seat — assistants are reserved for assistant seats.</p>
{:else}
  <p class="ssa-tip">This is a nursing-assistant seat.</p>
{/if}
```
Candidate rows show `{designation(c.nurse)}` instead of `{c.nurse.role}` and shield aria-label `in-charge qualified`.

10. CSS: change `.ssa-col-head, .ssa-day-row { grid-template-columns: 84px 1fr 1fr; }` to `84px 1fr 1fr 1fr`. Delete the `.tone-lpn` and `.ssa-badge2.lpn` rules. Change the `.ssa-badge2.prn` selector name and usage to `.ssa-badge2.contract` (update the markup in edit 3 accordingly).

- [ ] **Step 4: Write src/pages/demo.astro**

```astro
---
import Layout from '~/layouts/PageLayout.astro';
import DemoScheduler from '~/components/demo-scheduler/DemoScheduler.svelte';

const metadata = {
  title: 'Interactive Nurse Duty Roster Demo',
  description:
    'Build a safe ward week in under a minute. A free, no-signup interactive demo of explainable nurse rostering on three 8-hour shifts, with 48-hour, rest and weekly-off rules enforced.',
  robots: { index: true, follow: true },
};
---

<Layout metadata={metadata}>
  <section class="relative overflow-hidden bg-page">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -top-24 left-1/2 h-80 w-[52rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"></div>
    </div>
    <div class="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8">
      <header class="mx-auto mb-8 max-w-3xl text-center">
        <h1 class="text-3xl font-bold tracking-tight text-default sm:text-4xl">Interactive nurse duty roster demo</h1>
        <p class="mt-3 text-lg text-muted">
          Watch the engine roster a ward across morning, evening and night shifts, then cover an absence with a ranked
          shortlist. Free, in your browser, no signup.
        </p>
      </header>
      <DemoScheduler client:visible />
    </div>
  </section>
</Layout>
```

- [ ] **Step 5: Verify in the browser**

Run `npm run fix && npm run check && npm run build`, then `npm run dev` and open `/demo` in the Browser pane. Click "Fill all the slots": all 21 cells fill, checklist shows 6 ticks, status "21/21 shifts staffed · 0 violations". Click "Try to break a rule": a Mon–Sat stress note appears; clicking "Force anyway" on the highlighted nurse flags the weekly-off rule. Click "Staff nurse absent", "In-charge absent", "Assistant absent" in turn and assign the top candidate each time; status returns to 0 violations. Console shows no errors. Check at 375px width that the three shift cells stack and no horizontal scroll appears on the page body.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(demo): interactive roster demo on three 8-hour shifts

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Cost calculator in INR

**Files:**
- Create: `src/components/widgets/CostCalculatorWidget.svelte`, `src/components/widgets/CostCalculatorSection.astro`, `src/pages/cost-calculator.astro`

**Interfaces:**
- Consumes `LEAD_CAPTURE_URL`, `formatINR`, `PRICE_MONTHLY_INR` from `~/site`.
- Produces `<CostCalculatorSection />` (no props).

- [ ] **Step 1: Write src/components/widgets/CostCalculatorWidget.svelte**

```svelte
<script lang="ts">
  import { LEAD_CAPTURE_URL, formatINR, PRICE_MONTHLY_INR } from '~/site';

  // Assumption constants (INR). Educated estimates for a 300+ bed Indian corporate
  // hospital; shown to the visitor as editable assumptions, not sourced figures.
  const RATES = {
    supervisorHour: 500, // loaded cost of a nursing supervisor hour (~₹80k/month)
    overtimePremiumHour: 150, // premium above a ~₹200/h staff nurse base
    contractNurseHour: 450, // contract nurse, all-in hourly
    replacementCost: 120000, // recruit, onboard, cover a vacancy
  };

  let supervisorHours = $state(40); // hours/week across wards on rostering
  let otHours = $state(200); // overtime hours/week across nursing staff
  let contractShifts = $state(60); // contract nurse shifts per month
  let exits = $state(12); // exits in past year where rostering was a factor
  let nurses = $state(400); // roster size, for the comparison line

  const supervisorCost = $derived(Math.round(supervisorHours * 52 * RATES.supervisorHour));
  const otCost = $derived(Math.round(otHours * 52 * RATES.overtimePremiumHour));
  const contractCost = $derived(Math.round(contractShifts * 8 * RATES.contractNurseHour * 12));
  const attritionCost = $derived(exits * RATES.replacementCost);
  const totalCost = $derived(supervisorCost + otCost + contractCost + attritionCost);
  const subscription = $derived(nurses * PRICE_MONTHLY_INR * 12);

  let showForm = $state(false);
  let showResults = $state(false);
  let submitting = $state(false);
  let submitError = $state(false);
  let formName = $state('');
  let formTitle = $state('');
  let formHospital = $state('');
  let formEmail = $state('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    submitting = true;
    submitError = false;
    const payload = {
      source: 'cost-calculator',
      timestamp: new Date().toISOString(),
      name: formName,
      title: formTitle,
      hospital: formHospital,
      email: formEmail,
      supervisorHours,
      otHours,
      contractShifts,
      exits,
      nurses,
      supervisorCost,
      otCost,
      contractCost,
      attritionCost,
      totalCost,
    };
    try {
      await fetch(LEAD_CAPTURE_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
      showResults = true;
    } catch {
      submitError = true;
    } finally {
      submitting = false;
    }
  }

  const sliders = [
    { key: 'supervisorHours', label: 'Supervisor hours per week spent on rostering, across all wards', min: 5, max: 120, step: 5, unit: 'hrs' },
    { key: 'otHours', label: 'Overtime hours per week across nursing staff', min: 0, max: 1000, step: 20, unit: 'hrs' },
    { key: 'contractShifts', label: 'Contract nurse shifts per month', min: 0, max: 400, step: 10, unit: 'shifts' },
    { key: 'exits', label: 'Nurse exits in the past year where rostering was a factor', min: 0, max: 100, step: 1, unit: 'exits' },
    { key: 'nurses', label: 'Nurses on your roster (for the comparison line)', min: 50, max: 2000, step: 50, unit: 'nurses' },
  ] as const;

  const values = {
    get supervisorHours() { return supervisorHours; }, set supervisorHours(v: number) { supervisorHours = v; },
    get otHours() { return otHours; }, set otHours(v: number) { otHours = v; },
    get contractShifts() { return contractShifts; }, set contractShifts(v: number) { contractShifts = v; },
    get exits() { return exits; }, set exits(v: number) { exits = v; },
    get nurses() { return nurses; }, set nurses(v: number) { nurses = v; },
  };

  const inputClass =
    'block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
</script>

<div class="mx-auto max-w-2xl">
  <div class="space-y-8">
    {#each sliders as s (s.key)}
      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700" for={`slider-${s.key}`}>{s.label}</label>
          <span class="ml-4 shrink-0 text-sm font-bold text-primary">{values[s.key].toLocaleString('en-IN')} {s.unit}</span>
        </div>
        <input
          id={`slider-${s.key}`}
          type="range"
          min={s.min}
          max={s.max}
          step={s.step}
          bind:value={values[s.key]}
          class="w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary h-2"
        />
        <div class="mt-1 flex justify-between text-xs text-muted"><span>{s.min}</span><span>{s.max.toLocaleString('en-IN')}</span></div>
      </div>
    {/each}
  </div>

  {#if !showResults}
    <div class="mt-10 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <p class="text-sm text-muted">Your estimated hidden rostering cost per year</p>
      <div class="pointer-events-none mt-2 select-none text-5xl font-bold tracking-tight blur-2xl">₹66,32,000</div>
      <p class="mt-3 text-sm text-muted">Enter your details to reveal your number</p>
      {#if !showForm}
        <button onclick={() => (showForm = true)} class="btn-primary mt-5">Reveal my cost breakdown</button>
      {:else}
        <form onsubmit={handleSubmit} class="mt-6 space-y-3 text-left">
          <input type="text" placeholder="Your name" bind:value={formName} required class={inputClass} />
          <input type="text" placeholder="Your role (e.g. CNO, Nursing Superintendent)" bind:value={formTitle} required class={inputClass} />
          <input type="text" placeholder="Hospital name" bind:value={formHospital} required class={inputClass} />
          <input type="email" placeholder="Work email" bind:value={formEmail} required class={inputClass} />
          {#if submitError}<p class="text-sm text-red-600">Something went wrong. Please try again.</p>{/if}
          <button type="submit" disabled={submitting} class="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Calculating…' : 'Show my results'}
          </button>
          <p class="text-center text-xs text-muted">No spam. We follow up once, and only if we think we can help.</p>
        </form>
      {/if}
    </div>
  {:else}
    <div class="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-8 shadow-sm">
      <h3 class="mb-6 text-center text-lg font-semibold">Your estimated hidden rostering cost per year</h3>
      <div class="space-y-3">
        {#each [
          ['Supervisor time on rostering', supervisorCost],
          ['Overtime premium', otCost],
          ['Contract nurse cover', contractCost],
          ['Attrition linked to rostering', attritionCost],
        ] as [label, value] (label)}
          <div class="flex items-center justify-between border-b border-primary/10 py-2">
            <span class="text-sm text-gray-700">{label}</span>
            <span class="text-sm font-semibold">{formatINR(value)}</span>
          </div>
        {/each}
        <div class="flex items-center justify-between pt-3">
          <span class="text-base font-bold">Total hidden rostering cost</span>
          <span class="text-2xl font-bold text-primary">{formatINR(totalCost)}</span>
        </div>
        <div class="flex items-center justify-between border-t border-primary/10 pt-3">
          <span class="text-sm text-gray-700">SimpleRosterAI for {nurses.toLocaleString('en-IN')} nurses, per year, GST extra</span>
          <span class="text-sm font-semibold">{formatINR(subscription)}</span>
        </div>
      </div>
      <p class="mt-4 text-center text-xs text-muted">
        Editable assumptions: supervisor hour {formatINR(RATES.supervisorHour)}, overtime premium {formatINR(RATES.overtimePremiumHour)} per hour,
        contract nurse {formatINR(RATES.contractNurseHour)} per hour, replacement cost {formatINR(RATES.replacementCost)} per exit. These are estimates; replace
        them with your own finance figures.
      </p>
      <div class="mt-6 text-center">
        <a href="/pricing" class="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary">See pricing</a>
      </div>
    </div>
  {/if}
</div>
```

- [ ] **Step 2: Write src/components/widgets/CostCalculatorSection.astro**

```astro
---
import WidgetWrapper from '~/components/ui/WidgetWrapper.astro';
import Headline from '~/components/ui/Headline.astro';
import CostCalculatorWidget from './CostCalculatorWidget.svelte';
import type { Widget } from '~/types';

type Props = Widget;
const { id, isDark = false, classes = {}, bg = await Astro.slots.render('bg') } = Astro.props;

const title = 'Calculate your hidden rostering costs';
const subtitle =
  'Supervisor hours, overtime, contract cover and attrition add up across a 300-bed hospital. Move the sliders to your numbers and see the yearly total.';
---

<WidgetWrapper id={id} isDark={isDark} containerClass={`max-w-5xl ${classes?.container ?? ''}`} bg={bg}>
  <div class="text-center mb-12">
    <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">Rostering cost calculator</p>
    <Headline title={title} subtitle={subtitle} classes={{ title: 'text-3xl sm:text-4xl', subtitle: 'text-lg' }} />
  </div>
  <CostCalculatorWidget client:load />
</WidgetWrapper>
```

- [ ] **Step 3: Write src/pages/cost-calculator.astro**

```astro
---
import Layout from '~/layouts/PageLayout.astro';
import SchemaOrg from '~/components/common/SchemaOrg.astro';
import DarkHero from '~/components/widgets/DarkHero.astro';
import CostCalculatorSection from '~/components/widgets/CostCalculatorSection.astro';
import { SITE_URL, BOOKING_URL } from '~/site';

const metadata = {
  title: 'Nurse Rostering Cost Calculator',
  description:
    'Estimate what nurse duty rostering really costs your hospital each year: supervisor time, overtime premium, contract nurse cover and rostering-linked attrition, in rupees.',
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: metadata.title,
  description: metadata.description,
  url: `${SITE_URL}/cost-calculator`,
  isPartOf: { '@id': `${SITE_URL}/#organization` },
};
---

<Layout metadata={metadata}>
  <SchemaOrg slot="head" schema={[webPageSchema]} />
  <DarkHero
    badge="Rostering cost calculator"
    title="What is rostering really costing you?"
    subtitle="Move the sliders to match your hospital. The assumptions are shown with the result so your finance team can replace them."
  />
  <CostCalculatorSection />
  <section class="bg-page pb-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
      <a href={BOOKING_URL} class="btn btn-primary inline-flex px-6 py-3 text-base">Book a demo</a>
      <p class="mt-3 text-sm text-muted">₹400 per nurse per month, GST extra. Supervisors and the CNO are free.</p>
    </div>
  </section>
</Layout>
```

- [ ] **Step 4: Verify**

`npm run fix && npm run check && npm run build`, then open `/cost-calculator` in the dev server. Defaults show; the revealed total for defaults must read `₹66,32,000` (40×52×500 = 10,40,000; 200×52×150 = 15,60,000; 60×8×450×12 = 25,92,000; 12×1,20,000 = 14,40,000). The blurred teaser shows the same figure. The subscription line for 400 nurses reads `₹19,20,000`. Confirm Indian digit grouping throughout.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: INR rostering cost calculator

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Pricing page

**Files:**
- Create: `src/pages/pricing.astro`

**Interfaces:**
- Consumes `DarkHero`, `FAQs`, `CallToAction`, and `~/site` exports.

- [ ] **Step 1: Write src/pages/pricing.astro**

```astro
---
import Layout from '~/layouts/PageLayout.astro';
import SchemaOrg from '~/components/common/SchemaOrg.astro';
import DarkHero from '~/components/widgets/DarkHero.astro';
import FAQs from '~/components/widgets/FAQs.astro';
import CallToAction from '~/components/widgets/CallToAction.astro';
import { SITE_NAME, SITE_URL, BOOKING_URL, PRICE_MONTHLY_INR, PRICE_ANNUAL_INR, formatINR } from '~/site';

const metadata = {
  title: 'Pricing',
  description: `${SITE_NAME} pricing: ${formatINR(PRICE_MONTHLY_INR)} per nurse per month or ${formatINR(PRICE_ANNUAL_INR)} per nurse per year, GST extra. Only nurses are billed; supervisors, in-charges and the CNO are free.`,
};

const tiers = [
  {
    name: 'Monthly',
    price: formatINR(PRICE_MONTHLY_INR),
    cadence: 'per nurse / month',
    note: 'Month to month, cancel anytime. GST extra.',
    featured: false,
  },
  {
    name: 'Annual',
    price: formatINR(PRICE_ANNUAL_INR),
    cadence: 'per nurse / year',
    note: 'Two months free against monthly billing. GST extra.',
    featured: true,
  },
  {
    name: 'Hospital groups',
    price: 'Talk to us',
    cadence: 'multi-hospital rollout',
    note: 'Volume pricing, group-level reporting, a single rollout plan across sites.',
    featured: false,
  },
];

const example = { nurses: 400, monthly: 400 * PRICE_MONTHLY_INR, annual: 400 * PRICE_ANNUAL_INR };

const included = [
  {
    title: 'The roster runs',
    items: [
      'AI-built duty roster for every ward, every cycle, checked against your rules before anyone sees it',
      '21 automated checks: in-charge cover, skill mix, 48-hour week, 12-hour rest, weekly off, night rotation, leave',
      'Excel roster in, published roster out, PDF for the notice board and Excel for HR',
    ],
  },
  {
    title: 'Your nurses on their phones',
    items: [
      'Duty calendar, leave requests, swap requests and absence reporting in the browser, nothing to install',
      'Ranked replacement shortlist with reasons the moment an absence is logged, any hour',
    ],
  },
  {
    title: 'Your nursing office in control',
    items: [
      'Nothing publishes without the CNO or supervisor approving it',
      'Rule changes (ratios, ward norms, rotation policy) applied from the next cycle',
      'Nurses added or removed as the roster changes; billing follows headcount',
    ],
  },
  {
    title: 'The paper trail',
    items: [
      'Full audit trail of every change: who, what, when',
      'Overtime, weekly-off and rest-hour reports ready for NABH audit and HR',
    ],
  },
];

const faqs = [
  {
    title: 'Who counts as a billed user?',
    description:
      'Only nurses on the duty roster: staff nurses, senior staff nurses and nursing assistants you roster. Supervisors, in-charges who approve, the Nursing Superintendent and the CNO are free.',
  },
  {
    title: 'Is GST included?',
    description: 'No. Prices are exclusive of GST, which is added at the applicable rate on the invoice.',
  },
  {
    title: 'What happens when our nurse count changes?',
    description:
      'Add or remove nurses at any time. Monthly billing follows the count on the billing date. On annual plans, added nurses are billed pro rata for the remaining term.',
  },
  {
    title: 'Is there a setup fee?',
    description:
      'No. Guided setup over four weeks is included: workspace, roster import, rules mapping, test cycles and supervisor training.',
  },
  {
    title: 'Can we pilot one ward first?',
    description:
      'Yes. Most hospitals start with one or two wards on the monthly plan and move the rest across once the first live cycle is approved.',
  },
];

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Nurse Rostering Software',
  operatingSystem: 'Web',
  url: `${SITE_URL}/pricing`,
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'INR',
    lowPrice: String(PRICE_MONTHLY_INR),
    highPrice: String(PRICE_ANNUAL_INR),
    offerCount: '2',
    description: 'Per-nurse pricing, GST extra',
  },
};
---

<Layout metadata={metadata}>
  <SchemaOrg slot="head" schema={[productSchema]} />

  <DarkHero
    badge="Per nurse. Supervisors and the CNO free."
    title="Simple per-nurse pricing"
    subtitle={`${formatINR(PRICE_MONTHLY_INR)} per nurse per month, or ${formatINR(PRICE_ANNUAL_INR)} per nurse per year. No setup fee, no per-ward fee, GST extra.`}
    actions={[
      { text: 'Book a demo', href: BOOKING_URL, variant: 'primary' },
      { text: 'Try the interactive demo', href: '/demo', variant: 'secondary' },
    ]}
  />

  <section class="bg-page">
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div class="grid gap-6 md:grid-cols-3">
        {
          tiers.map((tier) => (
            <div class={`rounded-2xl border p-8 ${tier.featured ? 'border-primary/50 bg-primary/5' : 'border-hairline bg-white'}`}>
              <h2 class="text-xl font-bold">{tier.name}</h2>
              <p class="mt-4 text-4xl font-bold">{tier.price}</p>
              <p class="mt-1 text-sm font-medium text-primary">{tier.cadence}</p>
              <p class="mt-2 text-sm text-muted">{tier.note}</p>
              <a href={BOOKING_URL} class={`btn mt-6 w-full ${tier.featured ? 'btn-primary' : ''}`}>Book a demo</a>
            </div>
          ))
        }
      </div>

      <p class="mt-6 text-center text-sm text-muted">
        Worked example: a hospital rostering {example.nurses} nurses pays {formatINR(example.monthly)} a month, or
        {formatINR(example.annual)} a year on the annual plan, plus GST.
      </p>

      <div class="mt-14">
        <h2 class="font-heading text-2xl font-semibold">What the subscription includes</h2>
        <p class="mt-2 text-muted">The list a CNO can put in front of finance at renewal.</p>
        <div class="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {
            included.map((group) => (
              <div class="border-t border-ink/10 pt-5">
                <h3 class="text-lg font-bold">{group.title}</h3>
                <ul class="mt-3 space-y-2.5">
                  {group.items.map((item) => (
                    <li class="flex items-start gap-3">
                      <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span class="text-default/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          }
        </div>
      </div>

      <div class="mt-12 border-t border-ink/10 pt-10 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">What it replaces</p>
        <p class="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Nursing supervisors who spend a day a week each building and patching ward rosters, overtime that nobody
          planned, and contract cover booked at the last minute. Put your own numbers in the
          <a href="/cost-calculator" class="underline">cost calculator</a>.
        </p>
      </div>
    </div>
  </section>

  <FAQs title="Pricing questions" tagline="Common questions" items={faqs} />

  <CallToAction
    title="See it on one of your own wards."
    subtitle="A 30-minute demo on your roster, your rules, your shift pattern."
    tagline="Book a demo"
    actions={[
      { variant: 'primary', text: 'Book a demo', href: BOOKING_URL },
      { variant: 'secondary', text: 'Try the interactive demo', href: '/demo' },
    ]}
  />
</Layout>
```

- [ ] **Step 2: Verify and commit**

`npm run fix && npm run check && npm run build`. `dist/pricing/index.html` contains `₹400`, `₹4,000`, `₹1,60,000` and `₹16,00,000`.

```bash
git add -A
git commit -m "feat: per-nurse INR pricing page

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Duty roster template workbook and page

**Files:**
- Create: `scripts/build-template.py`, `public/downloads/SimpleRosterAI-Nurse-Duty-Roster-Template.xlsx` (generated), `src/pages/resources/nurse-duty-roster-template.astro`

**Interfaces:**
- Consumes the source workbook from the sibling US site's downloads folder (read-only; path supplied via the `ROSTER_TEMPLATE_SRC` env var).
- Produces the download at `/downloads/SimpleRosterAI-Nurse-Duty-Roster-Template.xlsx`.

- [ ] **Step 1: Write scripts/build-template.py**

```python
"""Patch the source scheduling workbook into the SimpleRosterAI duty roster template.

Keeps every formula, named range, data validation and conditional format; rewrites
inputs, sample data, shift codes and copy for Indian hospitals on three 8-hour shifts.
Run: python scripts/build-template.py
"""
from datetime import datetime
from pathlib import Path
import openpyxl
from openpyxl.worksheet.datavalidation import DataValidation

SRC = Path(os.environ.get("ROSTER_TEMPLATE_SRC", "../sibling-site/public/downloads/sibling-site-nurse-schedule-template.xlsx"))
OUT = Path("public/downloads/SimpleRosterAI-Nurse-Duty-Roster-Template.xlsx")
BRAND = "SimpleRosterAI · simplerosterai.com"

wb = openpyxl.load_workbook(SRC)

# 1. Branding strings and formula role literals everywhere.
for ws in wb.worksheets:
    for row in ws.iter_rows():
        for c in row:
            v = c.value
            if not isinstance(v, str):
                continue
            if "sibling-site" in v.lower() and not v.startswith("="):
                c.value = BRAND
            elif v.startswith("="):
                c.value = v.replace('"RN"', '"SN"').replace('"LPN"', '"NA"').replace('"CNA"', '"NA"')
    for dv in list(ws.data_validations.dataValidation):
        if dv.formula1 and "RN" in dv.formula1 and "LPN" in dv.formula1:
            dv.formula1 = '"SN,NA"'

# 2. Rules.
rules = wb["Rules"]
rules["B2"] = 48
rules["B3"] = 12
rules["B4"] = 6
rules["B5"] = 8
rules["A7"] = "Shift_Basis_Hours = the shift length the requirement math divides by (8 for three 8-hour shifts)."

# 3. Shift codes.
shifts = wb["Shifts"]
codes = [
    ("M8", "Morning 8hr", "Day", 8, 7, 15),
    ("E8", "Evening 8hr", "Day", 8, 15, 23),
    ("N8", "Night 8hr", "Night", 8, 23, 31),
    ("WO", "Weekly Off", "Off", 0, 0, 0),
    ("CL", "Casual Leave", "Off", 0, 0, 0),
    ("SL", "Sick Leave", "Off", 0, 0, 0),
    ("EL", "Earned Leave", "Off", 0, 0, 0),
    ("NH", "National Holiday", "Off", 0, 0, 0),
]
for r in range(2, 15):
    for col in "ABCDEF":
        shifts[f"{col}{r}"] = None
for i, row in enumerate(codes, start=2):
    for col, val in zip("ABCDEF", row):
        shifts[f"{col}{i}"] = val
shifts["A16"] = "Day codes (M8, E8) drive day coverage; N8 drives night coverage; Off codes count as 0 hours."
shifts["A17"] = "End_Abs = Start_Hour + Hours. Over 24 means the shift ends next morning (N8 ends at 31 = 07:00)."
shifts["A18"] = "Rows 10-14 are open for custom codes (e.g. a 12-hour shift). Custom codes count toward hours, rest and consecutive-day checks."

# 4. Staff sample.
staff = wb["Staff"]
for col, h in zip("DEFGHI", ["ICU", "Emergency", "OT", "Dialysis", "NICU", "Paediatrics"]):
    staff[f"{col}1"] = h
names = [
    ("Menon, Anjali", "SN"), ("Nair, Priya", "SN"), ("Sharma, Rekha", "SN"), ("Thomas, Joseph", "SN"), ("Patil, Sunita", "SN"),
    ("Krishnan, Deepa", "SN"), ("Iyer, Meena", "SN"), ("Verma, Ritu", "SN"), ("Pillai, Arun", "SN"), ("Reddy, Kavitha", "SN"),
    ("Joshi, Sneha", "SN"), ("Das, Lakshmi", "SN"), ("Gupta, Neha", "SN"), ("Khan, Farida", "SN"), ("Rao, Vijaya", "SN"),
    ("Kumar, Ramesh", "NA"), ("Yadav, Geeta", "NA"), ("Babu, Suresh", "NA"), ("Singh, Pooja", "NA"), ("Nathan, Divya", "NA"),
]
for r in range(2, 32):
    staff[f"A{r}"] = None
    staff[f"B{r}"] = None
for i, (n, role) in enumerate(names, start=2):
    staff[f"A{i}"] = n
    staff[f"B{i}"] = role
staff["A34"] = "Need more than 30 staff, or a version adapted to your hospital? See simplerosterai.com."

# 5. Units.
units = wb["Units"]
units["A2"], units["A3"], units["A4"] = "General Ward", "ICU", "HDU"

# 6. Schedule sample codes, week start, leave and holidays.
sched = wb["Schedule"]
sched["B1"] = "General Ward"
sched["B2"] = datetime(2026, 9, 7)
code_map = {"D12": "M8", "N12": "N8", "D8": "M8", "E8": "E8", "P4D": "M8", "P4N": "N8", "PTO": "CL", "SICK": "SL", "VAC": "EL", "WO": "WO"}
for r in range(12, 42):
    for col in "DEFGHIJ":
        v = sched[f"{col}{r}"].value
        if isinstance(v, str) and v in code_map:
            sched[f"{col}{r}"] = code_map[v]
leave = wb["Leave"]
leave["A2"], leave["B2"], leave["C2"], leave["D2"] = "Menon, Anjali", datetime(2026, 9, 7), datetime(2026, 9, 8), "CL"
leave["A3"], leave["B3"], leave["C3"], leave["D3"] = "Nair, Priya", datetime(2026, 9, 9), datetime(2026, 9, 9), "SL"
leave["A4"], leave["B4"], leave["C4"], leave["D4"] = "Krishnan, Deepa", datetime(2026, 9, 12), datetime(2026, 9, 13), "EL"
hol = wb["Holidays"]
hol["A2"], hol["B2"] = datetime(2026, 10, 2), "Gandhi Jayanti"

# 7. Instructions and Beyond tabs.
ins = wb["Instructions"]
ins["B8"] = "Nurse Duty Roster Template"
ins["B9"] = "A free weekly duty roster worksheet for one hospital ward on three 8-hour shifts. Built by SimpleRosterAI."
ins["B15"] = "    •  Staff:  Your roster: name, role (SN = staff nurse, NA = nursing assistant), FTE, and area skills."
ins["B17"] = "    •  Rules:  Your weekly hours cap (48), minimum rest between duties (12), max consecutive duty days (6), and shift length (8)."
ins["B19"] = "    •  Holidays / Leave:  National holidays, and any approved CL / SL / EL for the week."
ins["B23"] = "    •  A weekly duty grid:  Pick M8, E8, N8, WO or a leave code per nurse per day from the dropdown."
ins["B24"] = "    •  Weekly hours + 48h flag:  Each nurse's total hours, flagged OVER when they cross the weekly cap."
ins["B25"] = "    •  Coverage gap check:  Assigned nurses vs required nurses each day and night. A positive gap (red) means you are short."
ins["B33"] = "Notes: names on the Leave tab must match the Staff tab exactly. The roster holds up to 30 staff. Consecutive-day and rest checks look at the displayed week only."
ins["B36"] = "It will not build the roster for you, balance night rotation and weekend fairness across weeks, or find a qualified replacement when a nurse is absent. That is what SimpleRosterAI does."
ins["B38"] = "Not medical, legal or compliance advice. Verify all figures against your own hospital policy and applicable law."
ins["B39"] = BRAND
beyond = wb["Beyond this template"]
beyond["B3"] = "A spreadsheet can hold the inputs and do the maths. It cannot make the judgement calls below. That is where rostering software takes over."
beyond["B5"] = "•  Skill requirement per shift and per nurse (ICU, Emergency, OT, Dialysis cover guaranteed every shift)."
beyond["B6"] = "•  Night rotation, weekend and holiday fairness tracked across weeks, not just the current one."
beyond["B7"] = "•  Preventing rest-hour, weekly-off and consecutive-day breaks while the roster is built, and remembering them across weeks."
beyond["B8"] = "•  Finding a qualified, under-48-hour replacement in minutes when a nurse is absent."
beyond["B9"] = "•  Float pool levels (home ward only vs cross-trained) and hard blocks for critical-care areas."
beyond["B10"] = "•  Leave, holidays and census flowing in from HRMS instead of manual entry."
beyond["B12"] = "SimpleRosterAI does these automatically, then hands the finished roster to your nursing office to approve. See how it works at simplerosterai.com."

OUT.parent.mkdir(parents=True, exist_ok=True)
wb.save(OUT)

# 8. Verify: no old brand or role literals remain in any cell.
chk = openpyxl.load_workbook(OUT)
bad = []
for ws in chk.worksheets:
    for row in ws.iter_rows():
        for c in row:
            if isinstance(c.value, str) and any(t in c.value for t in ("sibling-site", '"RN"', "LPN", "CNA", "PTO", "D12", "N12")):
                bad.append((ws.title, c.coordinate, c.value[:60]))
if bad:
    raise SystemExit(f"leftover source strings: {bad}")
print(f"wrote {OUT} ({OUT.stat().st_size} bytes), {len(chk.worksheets)} sheets, validations preserved: "
      f"{sum(len(ws.data_validations.dataValidation) for ws in chk.worksheets)}")
```

- [ ] **Step 2: Generate and inspect**

```bash
pip install openpyxl 2>/dev/null; python scripts/build-template.py
```
Expected: prints `wrote public/downloads/...`, validations preserved count > 0, no `leftover source strings` error. Then open the workbook with a quick python check that the Schedule tab's K12 formula still references `ShiftCode` and that `Rules!B2 == 48`. If the source `Shifts` tab data validation on the Schedule grid lists codes by range (e.g. `=ShiftCode`), nothing else is needed; if it lists literal codes, replace it in step 1 with `'"M8,E8,N8,WO,CL,SL,EL,NH"'`.

- [ ] **Step 3: Write src/pages/resources/nurse-duty-roster-template.astro**

```astro
---
import Layout from '~/layouts/PageLayout.astro';
import SchemaOrg from '~/components/common/SchemaOrg.astro';
import DarkHero from '~/components/widgets/DarkHero.astro';
import { SITE_NAME, SITE_URL, BOOKING_URL } from '~/site';

const metadata = {
  title: 'Nurse Duty Roster Template: Free Excel Download',
  description:
    'Download a free Excel nurse duty roster template for Indian hospitals: three 8-hour shift codes, 48-hour week, 12-hour rest and weekly-off flags, leave clashes and a live coverage check. No email required.',
};

const fileUrl = '/downloads/SimpleRosterAI-Nurse-Duty-Roster-Template.xlsx?v=20260902';

const outputs = [
  ['Required nurses per day and night', 'Calculated from your census, nursing hours per patient day and staff-nurse share.'],
  ['Weekly hours per nurse', 'Totalled automatically from the M8, E8 and N8 codes you assign.'],
  ['48-hour flag', 'OVER appears when a nurse crosses the weekly hours cap you set on the Rules tab.'],
  ['Consecutive-days flag', 'OVER appears when a run of duty days passes your limit (six by default).'],
  ['Rest-hours flag', 'SHORT appears when back-to-back duties leave less than 12 hours rest. Evening into morning is the classic catch.'],
  ['Leave-clash flag', 'CHECK appears when the grid has someone on duty on a day the Leave tab says they are off.'],
  ['Coverage gap check', 'Assigned versus required nurses for every day and night. A positive number means you are short.'],
];

const inputs = [
  ['Staff', 'Your roster: name, role (SN or NA), FTE and area skills such as ICU or Emergency.'],
  ['Units', 'Nursing hours per patient day, day/night split and staff-nurse share for each ward.'],
  ['Rules', 'Weekly hours cap, minimum rest hours, maximum consecutive duty days and shift length.'],
  ['Census', 'The patient census per ward for each day of the week.'],
  ['Holidays and Leave', 'National holidays, plus approved CL, SL and EL for the week.'],
];

const faqs = [
  { q: 'Is the template really free?', a: 'Yes. Direct Excel download, no email, no trial. Input cells are open; formula cells are protected so an accidental keystroke cannot break the checks.' },
  { q: 'Does it support 12-hour shifts?', a: 'It ships with morning, evening and night 8-hour codes. Add a 12-hour code on the Shifts tab in a minute; hours, rest and consecutive-day checks pick it up automatically.' },
  { q: 'Does it build the roster for me?', a: 'No. You pick a code per nurse per day; the template does the maths and the checking. The judgement stays with your supervisor. Building the roster automatically is what the product does.' },
  { q: 'Will it work in Google Sheets?', a: 'It is built for Microsoft Excel 2016 or later. It generally imports into Google Sheets, but conditional-format colours may need re-applying.' },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Free Nurse Duty Roster Template', item: `${SITE_URL}/resources/nurse-duty-roster-template` },
  ],
};
---

<Layout metadata={metadata}>
  <SchemaOrg slot="head" schema={[breadcrumbSchema]} />
  <DarkHero
    badge="Free download · Excel · No email required"
    title="Free nurse duty roster template for hospital wards"
    subtitle="A weekly Excel duty roster that calculates required nurses from your census, then flags 48-hour, rest-hour, consecutive-day and weekly-off breaks, leave clashes and coverage gaps as you assign duties."
    actions={[{ text: 'Download the template (.xlsx)', href: fileUrl, variant: 'primary' }]}
  />

  <section class="bg-page">
    <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <p class="text-lg leading-relaxed text-default/90">
        Most free duty roster templates are a blank grid with days across the top. This one checks the roster you build
        against your own rules: hours, rest, consecutive days, weekly off and leave. You still make every assignment.
        The template does the maths.
      </p>

      <h2 class="mt-12 font-heading text-2xl font-semibold">What does the template calculate?</h2>
      <ul class="mt-5 space-y-3">
        {outputs.map(([t, d]) => (
          <li class="flex items-start gap-3">
            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span class="text-default/80"><strong class="text-default">{t}.</strong> {d}</span>
          </li>
        ))}
      </ul>

      <h2 class="mt-12 font-heading text-2xl font-semibold">What do you fill in?</h2>
      <p class="mt-3 text-default/80">Five input tabs with orange cells, plus the roster grid. Pick M8, E8, N8, WO or a leave code per nurse per day from a dropdown; the checks recalculate as you go.</p>
      <div class="mt-5 overflow-hidden rounded-xl border border-hairline">
        <table class="w-full text-sm">
          <tbody>
            {inputs.map(([t, d], i) => (
              <tr class={i % 2 ? 'bg-primary/5' : 'bg-white'}>
                <td class="w-40 px-4 py-3 font-semibold">{t}</td>
                <td class="px-4 py-3 text-default/80">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div class="mt-10 rounded-2xl border border-primary/40 bg-primary/5 p-8 text-center" id="download">
        <h2 class="font-heading text-2xl font-semibold">Download the template</h2>
        <p class="mx-auto mt-2 max-w-xl text-sm text-muted">One .xlsx file. Sample ward included so every output is visible on open; replace it with your own roster and rules.</p>
        <a href={fileUrl} class="btn btn-primary mt-5">Download the template (.xlsx)</a>
        <p class="mt-3 text-xs text-muted">No email. No signup. Not medical, legal or compliance advice.</p>
      </div>

      <h2 class="mt-12 font-heading text-2xl font-semibold">How do you use it?</h2>
      <ol class="mt-5 list-decimal space-y-2.5 pl-6 text-default/80">
        <li>Fill the Staff, Units and Rules tabs with your roster and policies.</li>
        <li>On the Schedule tab, pick the ward and set the week's Monday.</li>
        <li>Enter the week's census on the Census tab and approved leave on the Leave tab.</li>
        <li>Assign a code to each nurse for each day, watching the required rows at the top.</li>
        <li>Clear every OVER, SHORT and CHECK, and bring each coverage gap to zero.</li>
      </ol>

      <h2 class="mt-12 font-heading text-2xl font-semibold">What does it not do?</h2>
      <p class="mt-3 text-default/80">
        It will not build the roster, balance night rotation and weekends across weeks, or find an under-48-hour
        replacement when a nurse is absent at 2 AM. Its checks see one week at a time. That ceiling is why
        {SITE_NAME} exists: the engine builds every ward roster against all these rules at once, and your nursing
        office approves it. <a href="/how-it-works" class="text-primary underline">See how it works</a>.
      </p>

      <h2 class="mt-12 font-heading text-2xl font-semibold">Frequently asked questions</h2>
      <div class="mt-5 space-y-6">
        {faqs.map((f) => (
          <div class="border-t border-ink/10 pt-5">
            <h3 class="font-semibold">{f.q}</h3>
            <p class="mt-2 text-default/80">{f.a}</p>
          </div>
        ))}
      </div>

      <div class="mt-14 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
        <p class="text-lg font-semibold text-default mb-2">Rather approve a finished roster than build one?</p>
        <p class="text-muted text-sm mb-6">₹400 per nurse per month, GST extra. The engine builds it, your nursing office approves it.</p>
        <a href={BOOKING_URL} class="btn btn-primary">Book a demo</a>
        <p class="text-sm text-muted mt-4 mb-0"><a href="/demo" class="text-primary underline">Try the interactive demo →</a></p>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 4: Verify and commit**

`npm run fix && npm run check && npm run build`; `dist/downloads/SimpleRosterAI-Nurse-Duty-Roster-Template.xlsx` exists and `dist/resources/nurse-duty-roster-template/index.html` links to it.

```bash
git add -A
git commit -m "feat: free nurse duty roster template and page

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: How it works page and ProductFlow widget

**Files:**
- Create: `src/components/widgets/ProductFlow.astro` (copy of `$SRC/src/components/widgets/ProductFlow.astro` with copy edits), `src/pages/how-it-works.astro`

**Interfaces:**
- Consumes `DarkHero`, `Steps`, `FAQs`, `CallToAction`, `~/site`.
- Produces `<ProductFlow />` (no props), reused by the home page in Task 9.

- [ ] **Step 1: Copy and edit ProductFlow.astro**

```bash
cp "$SRC/src/components/widgets/ProductFlow.astro" src/components/widgets/
```
Then make these text replacements only (keep all markup and CSS):
- header comment: `for /product` → `for the product pages`; `DON approval` → `nursing office approval`
- `Roster in. Schedule out. You stay in charge.` → `Staff list in. Duty roster out. Your nursing office stays in charge.`
- `Charge coverage, skill mix, on-call limits, mapped once in guided setup` → `In-charge cover, skill mix, 48-hour week, night rotation, mapped once in guided setup`
- `Callouts, leave, swaps, availability, from a portal built for their phones` → `Absences, leave, swaps and availability, from a portal built for their phones`
- `<source-brand> engine` → `SimpleRosterAI engine`
- `Three complete schedules per cycle` → `Three complete rosters per cycle`
- `Callout ranker` → `Absence ranker`
- `Your DON approves` → `Your nursing office approves`
- `PDF for the board, Excel workbook, audit trail` → `PDF for the notice board, Excel for HR, audit trail`

- [ ] **Step 2: Write src/pages/how-it-works.astro**

```astro
---
import Layout from '~/layouts/PageLayout.astro';
import SchemaOrg from '~/components/common/SchemaOrg.astro';
import DarkHero from '~/components/widgets/DarkHero.astro';
import ProductFlow from '~/components/widgets/ProductFlow.astro';
import Steps from '~/components/widgets/Steps.astro';
import FAQs from '~/components/widgets/FAQs.astro';
import CallToAction from '~/components/widgets/CallToAction.astro';
import { SITE_NAME, SITE_URL, BOOKING_URL } from '~/site';

const metadata = {
  title: 'How it Works',
  description: `How ${SITE_NAME} rosters a hospital: the engine builds every ward's duty roster against your rules, nurses see it on their phones, and your nursing office approves. Four weeks from staff list to first live cycle.`,
};

const rules = [
  ['In-charge on every shift', 'A senior staff nurse holds the in-charge seat, morning, evening and night'],
  ['Skill mix holds', 'Staff nurse and nursing assistant seats filled by the right role, ICU and critical areas by cleared staff'],
  ['48-hour week', 'No nurse crosses the weekly cap; overtime is visible before it happens'],
  ['12-hour rest', 'No evening-into-morning turnaround, no night-into-day'],
  ['One weekly off', 'Every nurse gets a day off in seven, never a seventh straight duty'],
  ['Night rotation fairness', 'Nights spread across the ward, tracked across weeks'],
  ['Leave respected', 'Approved CL, SL and EL are never rostered over'],
  ['Contract availability', 'Contract nurses only on the days they signed up for'],
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'How it Works', item: `${SITE_URL}/how-it-works` },
  ],
};
---

<Layout metadata={metadata}>
  <SchemaOrg slot="head" schema={[breadcrumbSchema]} />

  <DarkHero
    badge="Clear workflow. Predictable handoffs."
    title="How it works"
    subtitle="The engine builds every ward's duty roster against your rules. Your nurses see their duties on their phones. Your supervisors and CNO approve. Rostering drops from a day a week per supervisor to an hour of review."
    actions={[
      { text: 'Book a demo', href: BOOKING_URL, variant: 'primary' },
      { text: 'Try the interactive demo', href: '/demo', variant: 'secondary' },
    ]}
  />

  <ProductFlow />

  <Steps
    title="Four weeks to go-live. Most of it is ours."
    subtitle="Guided setup is included in the subscription. No integration project, nothing for your IT team to install."
    tagline="Guided setup"
    items={[
      { title: 'Week 1: workspace and roster', description: 'We set up your hospital, import the staff Excel you already keep, and map wards and roles.', icon: 'tabler:number-1' },
      { title: 'Week 2: rules session', description: 'One session with your nursing office to map in-charge cover, skill mix, ratios, rotation policy and leave rules.', icon: 'tabler:number-2' },
      { title: 'Week 3: test cycles', description: 'We run test rosters against your real staff list until every rule holds. Your team does nothing this week.', icon: 'tabler:number-3' },
      { title: 'Week 4: go live', description: 'Supervisors are trained on one live cycle. The CNO approves the first published roster.', icon: 'tabler:number-4' },
    ]}
  />

  <section class="bg-ink text-ivory">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div class="max-w-2xl" data-reveal>
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sage">What is checked every cycle</p>
        <h2 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Every roster is compliant before it publishes.</h2>
        <p class="mt-4 text-lg text-ivory/70">21 automated checks run on every draft. The eight below are the ones a CNO asks about first; the rest cover ward-specific norms you map in setup.</p>
      </div>
      <ul class="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2" data-reveal-group>
        {rules.map(([rule, why]) => (
          <li class="border-t border-ivory/15 pt-4">
            <p class="font-semibold">{rule}</p>
            <p class="mt-1 text-sm text-ivory/60">{why}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>

  <section class="bg-page">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div class="max-w-2xl" data-reveal>
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">When a nurse is absent</p>
        <h2 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">A ranked shortlist, not a phone tree.</h2>
      </div>
      <div class="mt-8 grid gap-6 sm:grid-cols-3" data-reveal-group>
        <div class="rounded-xl border border-hairline bg-white p-5">
          <h3 class="font-bold">1. Absence logged</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">The nurse reports it from their phone, or the supervisor logs it. The seat opens on the roster.</p>
        </div>
        <div class="rounded-xl border border-hairline bg-white p-5">
          <h3 class="font-bold">2. Shortlist ranked</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">Every eligible nurse is ranked by rest, hours this week, night load and skill, with the reason shown. Ineligible nurses say why.</p>
        </div>
        <div class="rounded-xl border border-hairline bg-white p-5">
          <h3 class="font-bold">3. One tap to cover</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">The supervisor assigns, the nurse is notified, the roster and audit trail update themselves.</p>
        </div>
      </div>
    </div>
  </section>

  <FAQs
    title="Questions about the process"
    tagline="Common questions"
    items={[
      { title: 'How long does setup take, and what does our IT team have to do?', description: 'Four weeks, and your IT team has nothing to install. We import the staff Excel, map rules with your nursing office in one session, run test cycles, and train supervisors on a live cycle.' },
      { title: 'How do we get our data in?', description: 'Excel upload. Export from your HRMS or use the sheet you keep today, edit, re-import any time.' },
      { title: 'Do nurses need to install anything?', description: 'No. The nurse portal runs in the phone browser: duty calendar, leave and swap requests, absence reporting.' },
      { title: 'What happens when someone is absent at 2 AM?', description: 'The engine ranks replacements with reasons the moment the absence is logged. The supervisor on duty assigns with one tap.' },
      { title: 'How is fairness tracked?', description: 'Nights, weekends and public holidays are tracked per nurse across weeks, and every draft shows the trade-off it made.' },
      { title: 'Does it help with NABH audits?', description: 'Every change is logged with who, what and when. Weekly hours, rest and weekly-off reports export in one click.' },
      { title: 'What if we already use an HRMS?', description: 'Keep it. We replace the rostering spreadsheet or a basic HRMS module that does not enforce rules, not your HR or payroll system.' },
    ]}
  />

  <CallToAction
    title="See it on one of your own wards."
    subtitle="A 30-minute demo on your roster, your rules, your shift pattern. ₹400 per nurse per month, GST extra."
    tagline="Book a demo"
    actions={[
      { text: 'Book a demo', href: BOOKING_URL, variant: 'primary' },
      { text: 'Try the interactive demo', href: '/demo', variant: 'secondary' },
    ]}
  />
</Layout>
```

- [ ] **Step 3: Verify and commit**

`npm run fix && npm run check && npm run build`.

```bash
git add -A
git commit -m "feat: how it works page in product voice

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Home page and OG image

**Files:**
- Create: `src/pages/index.astro`, `scripts/build-social.py`, `src/assets/images/social.png` (generated)

**Interfaces:**
- Consumes `DarkHero`, `ProductFlow`, `FAQs`, `CallToAction`, `~/site`.

- [ ] **Step 1: Write scripts/build-social.py and generate the OG image**

```python
"""Generate the 1200x628 Open Graph image. Run: python scripts/build-social.py"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path("src/assets/images/social.png")
W, H = 1200, 628
img = Image.new("RGB", (W, H), (26, 35, 50))  # ink navy
d = ImageDraw.Draw(img)

def font(size):
    for name in ("georgia.ttf", "Georgia.ttf", "DejaVuSerif.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()

d.ellipse((1040, 60, 1140, 160), fill=(123, 175, 155))
d.text((80, 200), "SimpleRosterAI", font=font(84), fill=(250, 247, 242))
d.text((80, 320), "AI nurse duty rostering for Indian hospitals.", font=font(40), fill=(250, 247, 242))
d.text((80, 380), "The engine builds every ward roster. Your nursing office approves.", font=font(30), fill=(200, 205, 210))
d.text((80, 540), "simplerosterai.com", font=font(28), fill=(123, 175, 155))
OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, optimize=True)
print("wrote", OUT, img.size)
```

Run `pip install pillow 2>/dev/null; python scripts/build-social.py`. Expected: `wrote src/assets/images/social.png (1200, 628)`.

- [ ] **Step 2: Write src/pages/index.astro**

```astro
---
import Layout from '~/layouts/PageLayout.astro';
import SchemaOrg from '~/components/common/SchemaOrg.astro';
import DarkHero from '~/components/widgets/DarkHero.astro';
import ProductFlow from '~/components/widgets/ProductFlow.astro';
import FAQs from '~/components/widgets/FAQs.astro';
import CallToAction from '~/components/widgets/CallToAction.astro';
import { SITE_NAME, SITE_URL, BOOKING_URL, PRICE_MONTHLY_INR, PRICE_ANNUAL_INR, formatINR } from '~/site';

const metadata = {
  title: `${SITE_NAME} | AI Nurse Duty Rostering for Indian Hospitals`,
  description:
    'Every shift covered, every ward, without leaning on the same few nurses. AI builds the duty roster against 48-hour, rest and weekly-off rules; your nursing office approves. Per-nurse pricing.',
  ignoreTitleTemplate: true,
};

const faqs = [
  { title: 'How long does it take to get started?', description: 'Four weeks of guided setup, included in the subscription. You send the staff Excel you already keep, sit one rules session, and approve the first live roster. Nothing for IT to install.' },
  { title: 'Do nurses need to install anything?', description: 'No. Nurses get a portal in their phone browser: duty calendar, leave and swap requests, absence reporting. Supervisors approve from the roster side.' },
  { title: 'What happens when a nurse is absent at 2 AM?', description: 'The engine ranks every eligible replacement with reasons the moment the absence is logged. The supervisor on duty assigns with one tap; the roster and audit trail update themselves.' },
  { title: 'How do you handle ward-specific rules?', description: 'Mapped once in setup: in-charge cover, skill mix, ratios, night rotation policy, leave rules. Changes take effect from the next cycle.' },
  { title: 'We already have an HRMS. Does this replace it?', description: 'No. Keep your HR and payroll. We replace the rostering spreadsheet, or the HRMS roster module that does not enforce rules.' },
  { title: 'How is it priced?', description: `${formatINR(PRICE_MONTHLY_INR)} per nurse per month or ${formatINR(PRICE_ANNUAL_INR)} per nurse per year, GST extra. Only nurses on the roster are billed; supervisors, in-charges and the CNO are free.` },
];

const webSiteSchema = { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: SITE_URL };
const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: 'HealthcareApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'AggregateOffer', priceCurrency: 'INR', lowPrice: String(PRICE_MONTHLY_INR), highPrice: String(PRICE_ANNUAL_INR), offerCount: '2', description: 'Per-nurse pricing, GST extra' },
  provider: { '@id': `${SITE_URL}/#organization` },
};
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.title, acceptedAnswer: { '@type': 'Answer', text: f.description } })),
};

const pains = [
  ['Version drift', 'The notice board, the Excel and the WhatsApp photo disagree by Wednesday, and nobody knows which one is real.'],
  ['The hours recount', 'Every change means re-checking someone’s week by hand, or finding the 56-hour week on the overtime report after payroll.'],
  ['The ripple rebuild', 'One leave approval reopens the whole month: nights, weekly offs, in-charge cover, all rebalanced cell by cell, ward by ward.'],
];

const screens = [
  { eyebrow: 'Cycle drafts', title: 'Week of 7 Sep · Pick one of three', rows: [['Balanced', 'Coverage 100% · Fairness 92 · Overtime 0h', true], ['Fairness-optimised', 'Coverage 100% · Fairness 97 · Overtime 8h', false], ['Cost-optimised', 'Coverage 100% · Fairness 88 · Overtime 0h · fewest contract shifts', false]], foot: 'Every draft covers every shift. You pick the trade-off.' },
  { eyebrow: 'Rule checks', title: 'Draft validation · 21 / 21', rows: [['In-charge on every shift', '', true], ['Skill mix holds on nights and weekends', '', true], ['48-hour week clear for every nurse', '', true], ['Caught before publishing', 'Ritu V. was headed to 56h. Swapped Thursday night to Meena I., zero overtime.', false], ['12-hour rest between duties', '', true]], foot: 'No rule can be quietly skipped.' },
  { eyebrow: 'Absence logged · Night shift', title: 'Tue 02:14 · Replacement shortlist', rows: [['1. Kavitha R. · SN', 'Night-cleared · 32h this week · 1 night so far, below ward average', true], ['2. Arun P. · SN', 'Night-cleared · 40h this week, 48h if extended · in-charge backup', false], ['3. Deepa K. · SN', 'Available · 11h rest only, blocked by the 12-hour rule', false]], foot: 'Ranked in seconds, with reasons.' },
  { eyebrow: 'Swap request', title: 'Fri night · Awaiting your call', rows: [['Sneha J. gives away Fri 23:00 to 07:00', 'Requested from her phone, Tue 20:52', false], ['Priya N. takes it · Sr SN, night-cleared', 'Accepted Wed 06:15', false], ['Skill mix holds on both shifts · No overtime created · Rest gaps preserved', '', true]], foot: 'One tap to approve; the roster updates itself.' },
];
---

<Layout metadata={metadata}>
  <SchemaOrg slot="head" schema={[webSiteSchema, softwareAppSchema, faqSchema]} />

  <DarkHero
    badge="For CNOs of 300+ bed hospitals"
    title={'Next month’s duty roster <span class="text-sage">in minutes, not weekends</span>'}
    subtitle="Every shift covered on every ward, without leaning on the same few nurses. The AI builds the roster, 21 automated rule checks validate every draft, your nursing office approves. Runs in the browser, nothing to install."
    actions={[
      { text: 'Book a demo', href: BOOKING_URL, variant: 'primary' },
      { text: 'Try the interactive demo', href: '/demo', variant: 'secondary' },
    ]}
  >
    <p class="text-sm text-ivory/50">The demo runs in your browser. No signup, no sales call first.</p>
  </DarkHero>

  <section class="bg-page border-b border-hairline">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted" data-reveal>
        {['Excel staff list in, published roster out', '21 automated rule checks per draft', 'Nurses see duties on their phones', 'Built for Indian hospitals', `${formatINR(PRICE_MONTHLY_INR)} per nurse per month, no setup fee`].map((t) => (
          <span class="flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-primary"></span>{t}</span>
        ))}
      </div>
    </div>
  </section>

  <section class="bg-page border-b border-hairline">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div class="max-w-2xl" data-reveal>
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">The spreadsheet you replace</p>
        <h2 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">The grid was never the hard part</h2>
      </div>
      <div class="mt-8 grid gap-6 sm:grid-cols-3" data-reveal-group>
        {pains.map(([t, d]) => (
          <div class="rounded-xl border border-hairline bg-white p-5">
            <h3 class="font-bold">{t}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-muted">{d}</p>
          </div>
        ))}
      </div>
      <p class="mt-8 max-w-2xl leading-relaxed text-default/90" data-reveal>
        The fix is not a better grid. It is not filling the grid at all. <a href="/demo" class="text-primary underline">Watch the engine do it.</a>
      </p>
    </div>
  </section>

  <ProductFlow />

  <section class="bg-page">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div class="max-w-2xl" data-reveal>
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">The screens</p>
        <h2 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Four screens run your week</h2>
      </div>
      <div class="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2" data-reveal-group>
        {screens.map((s) => (
          <div class="flex flex-col rounded-xl border border-hairline bg-white shadow-[0_14px_40px_-28px_rgb(26_35_50/0.22)] overflow-hidden">
            <div class="bg-primary px-4 py-3">
              <p class="text-xs font-semibold text-white/70 uppercase tracking-wider">{s.eyebrow}</p>
              <p class="text-sm font-bold text-white mt-0.5">{s.title}</p>
            </div>
            <div class="p-4 space-y-2.5 text-xs flex-1">
              {s.rows.map(([label, detail, ok]) => (
                <div class={`rounded-lg border p-2.5 ${ok ? 'border-primary/40 bg-primary/5' : 'border-hairline'}`}>
                  <p class="text-sm font-semibold">{label}</p>
                  {detail && <p class="mt-0.5 text-muted">{detail}</p>}
                </div>
              ))}
            </div>
            <div class="border-t border-hairline px-4 py-2.5 bg-ivory"><span class="text-xs text-muted">{s.foot}</span></div>
          </div>
        ))}
      </div>
      <p class="mt-8 text-center text-xs text-muted" data-reveal>Illustrative screens with sample data, matching the engine in the <a href="/demo" class="text-primary underline">interactive demo</a>.</p>
    </div>
  </section>

  <section class="bg-page">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div class="max-w-2xl" data-reveal>
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
        <h2 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Simple per-nurse pricing</h2>
        <p class="mt-4 text-lg text-muted">{formatINR(PRICE_MONTHLY_INR)} per nurse per month, or {formatINR(PRICE_ANNUAL_INR)} per nurse per year, GST extra. Only nurses are billed. Supervisors, in-charges and the CNO are free. No setup fee.</p>
      </div>
      <div class="mt-6"><a href="/pricing" class="font-medium text-primary underline underline-offset-4">See full pricing and what is included →</a></div>
    </div>
  </section>

  <section class="bg-page border-t border-hairline">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div class="flex flex-col items-center gap-6 md:flex-row md:items-start" data-reveal>
        <img src="/founders/gautham.png" alt="Gautham, co-founder of SimpleRosterAI" class="h-24 w-24 rounded-full object-cover ring-1 ring-primary/25" loading="lazy" decoding="async" width="96" height="96" />
        <div class="max-w-2xl text-center md:text-left">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">The team</p>
          <h3 class="mt-2 text-lg font-bold">Gautham, Co-founder</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">3x founder, 15 years in tech. Built the system so it works from the staff list you already keep, with nothing for your nurses to install.</p>
        </div>
      </div>
    </div>
  </section>

  <FAQs title="Frequently asked questions" tagline="Common questions" items={faqs} />

  <CallToAction
    title="A compliant, published roster for every ward, every cycle."
    subtitle={`${formatINR(PRICE_MONTHLY_INR)} per nurse per month, GST extra. See it on one of your own wards.`}
    tagline="Book a demo"
    actions={[
      { variant: 'primary', text: 'Book a demo', href: BOOKING_URL },
      { variant: 'secondary', text: 'Try the interactive demo', href: '/demo' },
    ]}
  />
</Layout>
```

- [ ] **Step 3: Verify and commit**

`npm run fix && npm run check && npm run build`. Open `/` in the dev server at desktop and 375px widths: hero, trust row, pain cards, product flow, four screens, pricing teaser, Gautham block, FAQ, CTA all render; no horizontal scroll.

```bash
git add -A
git commit -m "feat: home page and OG image

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Smoke gate, repo docs, final verification

**Files:**
- Create: `scripts/smoke.mjs`, `public/llms.txt`, `CLAUDE.md`, `README.md`

- [ ] **Step 1: Write scripts/smoke.mjs**

```js
#!/usr/bin/env node
// Route set + banned-term gate over dist/. Exit 1 on any problem.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const ROUTES = ['', 'how-it-works', 'demo', 'pricing', 'cost-calculator', 'resources/nurse-duty-roster-template', 'contact', 'privacy', 'terms'];
// BANNED: the personal-name, US-market-term, source-brand-name, and
// source-vocabulary regexes listed in scripts/smoke.mjs (that file is the
// canonical, excluded-from-grep copy — not reproduced here).

const problems = [];
for (const r of ROUTES) {
  const file = path.join(dist, r, 'index.html');
  if (!fs.existsSync(file)) problems.push(`missing route: /${r}`);
}
if (!fs.existsSync(path.join(dist, '404.html'))) problems.push('missing 404.html');
if (!fs.existsSync(path.join(dist, 'downloads', 'SimpleRosterAI-Nurse-Duty-Roster-Template.xlsx'))) problems.push('missing template xlsx');

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|js|txt|xml)$/.test(e.name)) {
      const text = fs.readFileSync(p, 'utf8');
      for (const re of BANNED) {
        const m = text.match(re);
        if (m) problems.push(`${path.relative(dist, p)}: banned term "${m[0]}" (${re})`);
      }
    }
  }
}
walk(dist);

// Every built page must have exactly one <h1>.
for (const r of ROUTES) {
  const file = path.join(dist, r, 'index.html');
  if (!fs.existsSync(file)) continue;
  const n = (fs.readFileSync(file, 'utf8').match(/<h1[\s>]/g) ?? []).length;
  if (n !== 1) problems.push(`/${r}: expected 1 <h1>, found ${n}`);
}

if (problems.length) {
  console.error('smoke: FAIL');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log(`smoke: OK (${ROUTES.length} routes, ${BANNED.length} banned patterns)`);
```

Note on the banned list: `\bRN\b`, `\bLPN\b`, `\bCNA\b`, `\bPRN\b`, `\bDON\b`, `charge nurse` catch any US vocabulary that slipped through copy edits. Bundled JS from the demo is scanned too, so the engine and Svelte component must not contain them either (they do not, after Tasks 3 and 4).

- [ ] **Step 2: Write public/llms.txt**

```
# SimpleRosterAI

> AI nurse duty rostering software for Indian hospitals. The engine builds every
> ward's duty roster against 48-hour, 12-hour-rest, weekly-off and skill-mix
> rules; nurses see duties on their phones; the nursing office approves.

## Who it is for

- Chief Nursing Officers and Nursing Superintendents of 300+ bed hospitals and hospital groups in India
- Nursing supervisors who build ward rosters today in Excel or an HRMS module

## Core features

- Excel staff list upload, no integration project
- Three roster drafts per cycle: balanced, fairness-optimised, cost-optimised
- 21 automated rule checks per draft
- Ranked replacement shortlist when a nurse is absent
- Nurse phone portal for duties, leave, swaps and absences
- Audit trail and NABH-ready hours, rest and weekly-off reports

## Pricing

- ₹400 per nurse per month, or ₹4,000 per nurse per year, GST extra. Only nurses are billed.

## Key pages

- https://simplerosterai.com/
- https://simplerosterai.com/how-it-works
- https://simplerosterai.com/demo
- https://simplerosterai.com/pricing
- https://simplerosterai.com/cost-calculator
- https://simplerosterai.com/resources/nurse-duty-roster-template
- https://simplerosterai.com/contact
```

- [ ] **Step 3: Write CLAUDE.md**

```markdown
# SimpleRosterAI — Claude Project Instructions

## Product context

SimpleRosterAI: AI nurse duty rostering software for Indian hospitals. Buyer: the
CNO or Nursing Superintendent of a 300+ bed hospital or hospital group. Product
pricing: ₹400 per nurse per month, ₹4,000 per nurse per year, GST extra; only
nurses are billed. Frame everything from hospital nursing operations, not generic
tech.

Sibling of the sibling US site (US small-hospital market, managed
service). Do not import its market framing, vocabulary, pages or blog.

## Hard rules

- No personal name other than Gautham appears anywhere: site, schema, images,
  docs, comments, git history. `scripts/smoke.mjs` enforces the banned list.
- Every external value (booking link, email, capture endpoint, legal entity,
  prices) lives in `src/site.ts`. Pages import it; nothing is hard-coded.
- `TODO_` placeholders in `src/site.ts` block a production build
  (`SITE_ENV=production npm run build`).
- Vocabulary: duty roster, ward, in-charge, staff nurse, nursing assistant,
  absence, contract nurse, weekly off, 48-hour week, 12-hour rest. Three 8-hour
  shifts: morning 07:00–15:00, evening 15:00–23:00, night 23:00–07:00.
- Currency INR with Indian grouping via `formatINR`. Always "GST extra" next to a price.
- CTAs: primary "Book a demo" (`BOOKING_URL`), secondary "Try the interactive demo" (`/demo`).

## Commands

- `npm run dev`, `npm run build`, `npm run check`, `npm run fix`
- `npm test` — engine tests (`src/components/demo-scheduler/engine.test.ts`)
- `npm run smoke` — route set and banned terms over `dist/`
- `python scripts/build-template.py` — regenerate the roster template xlsx
- `python scripts/build-social.py` — regenerate the OG image

## Layout

| What | Where |
|---|---|
| Pages | `src/pages/` |
| Site values | `src/site.ts` |
| Demo engine + tests | `src/components/demo-scheduler/` |
| Calculator | `src/components/widgets/CostCalculatorWidget.svelte` |
| Spec | `docs/superpowers/specs/2026-09-02-simplerosterai-site-design.md` |
| Plan | `docs/superpowers/plans/2026-09-02-simplerosterai-site.md` |

## Git

Repo-local author is `SimpleRosterAI <dev@simplerosterai.com>`; never commit with a
personal identity. Push only when explicitly asked.
```

- [ ] **Step 4: Write README.md**

~~~markdown
# SimpleRosterAI website

Marketing site for SimpleRosterAI, AI nurse duty rostering for Indian hospitals.
Astro 5, Tailwind, Svelte 5.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # dist/ + placeholder check
npm test           # rostering engine tests
npm run smoke      # route + banned-term gate over dist/
```

Before launch, replace every `TODO_` value in `src/site.ts`, then run
`SITE_ENV=production npm run build`.
~~~

- [ ] **Step 5: Add `.prettierignore` entries and run the full gate**

Append to `.prettierignore`:
```
public/llms.txt
docs/**
```

Run, in order:
```bash
npm run fix
npm run check
npm test
npm run build
npm run smoke
SITE_ENV=production npm run build
```
Expected: check, test, build, smoke all exit 0. The final production build must FAIL with the five placeholder names listed (this proves the gate works). Re-run plain `npm run build` afterwards so `dist/` is left in a good state.

Then run the source-tree footprint gate:
```bash
npm run smoke:src
```
Expected: no output, exit 0. (See `scripts/check-source.mjs` and CLAUDE.md's Hard rules for the full pattern list.)

- [ ] **Step 6: Browser pass**

With `npm run dev` running, visit every route in the Browser pane at desktop and 375px widths: `/`, `/how-it-works`, `/demo`, `/pricing`, `/cost-calculator`, `/resources/nurse-duty-roster-template`, `/contact`, `/privacy`, `/terms`, and a bad URL for 404. Confirm: header nav has Home, How it works, Demo, Pricing, Resources; the "Book a demo" button appears in the header; footer shows three columns and "Built for Indian hospitals."; no console errors; no horizontal scroll on the body. Click the template download link and confirm the xlsx downloads.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: smoke gate, llms.txt, repo docs

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Self-review notes

- Spec §3 routes: Tasks 1 (404), 2 (contact, privacy, terms), 4 (demo), 5 (cost-calculator), 6 (pricing), 7 (template), 8 (how-it-works), 9 (home). All ten covered.
- Spec §4 placeholders: Task 1 (`site.ts`, `check-placeholders.mjs`); production failure proven in Task 10.
- Spec §5 engine: Task 3. Deviation: roster is 17 staff (13 staff nurses, 4 assistants) and night has one staff-nurse seat, chosen so 77 weekly seats fit 17 people at six duties each with leave and contract limits; the spec's 16/3 did not clear the assistant seats.
- Spec §6 calculator: Task 5, constants and Indian formatting as specified, plus a subscription comparison line.
- Spec §7 template: Task 7. Deviation: Python openpyxl patch of the source workbook instead of a Node exceljs rebuild, because patching keeps every formula, named range, validation and conditional format intact.
- Spec §8 technical: Task 1 (scaffold, deps, config, netlify, git), Task 10 (CLAUDE.md, README).
- Spec §9 verification: `npm run check`, `npm run build`, grep gate, engine tests, browser pass, all in Task 10; smoke script adds a banned-term scan of built output.
