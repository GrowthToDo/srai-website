# SimpleRosterAI.com — Site Design Spec

Date: 2026-09-02
Status: approved 2026-09-02

`$SRC` = the sibling US repo path, kept outside this repository.

## 1. Goal

Build simplerosterai.com, the Indian-market sibling of the sibling US site. Same
product (AI nurse rostering, rules engine, nurse phone portal), new market, new
buyer, new pricing model, minimal page set. The source repo is
`$SRC` (Astro 5 + Tailwind +
Svelte 5, AstroWind base).

## 2. Positioning

| Dimension | Sibling US site (source) | SimpleRosterAI (this site) |
|---|---|---|
| Market | US small-hospital market, small facilities | Indian corporate hospital chains, 300+ beds |
| Buyer | facility administrator, DON, Nurse Manager | Chief Nursing Officer (CNO); secondary: Nursing Superintendent, Nursing Supervisors |
| Offer | Managed service, flat per hospital | Software product, per nurse per month |
| Vocabulary | the US-market terms and the source brand name listed in scripts/smoke.mjs | duty roster, in-charge, Staff Nurse / Nursing Assistant, 48-hour week, weekly off, leave, absence |
| Shifts | two 12-hour (day/night) | three 8-hour (morning, evening, night) |
| Currency | USD | INR, GST extra |
| Named people | two founders | Gautham only |

Voice: hospital-operations, CNO's problems (coverage across many wards,
supervisor time, overtime and contract-nurse spend, attrition, audit and NABH
readiness). Never generic tech copy. British/Indian English spelling
(roster, organisation, licence).

No personal name other than Gautham appears anywhere: no page, no schema, no image, no git author on
the public repo, no reference in comments, docs, or file names.

## 3. Pages (final list)

| Route | Source basis | Notes |
|---|---|---|
| `/` | `product.astro` (product voice) with hero patterns from `index.astro` | Product-based home. Hero, trust row, "the spreadsheet you replace", demo section, product flow, four screens, guided setup, pricing teaser, FAQ, CTA |
| `/how-it-works` | `product.astro` guided-setup + `how-it-works.astro` structure | Four-week guided setup, nurse portal, CNO/supervisor approval loop, rules checks. Product voice, not managed-service voice |
| `/demo` | `simulator.astro` + `DemoScheduler.svelte` + `engine.ts` | Interactive rostering demo, reworked for 3 x 8-hour shifts, Indian roles and names |
| `/pricing` | `pricing.astro` layout, `product.astro` tiers | ₹400 per nurse per month; ₹4,000 per nurse per year; chains: talk to us. Only nurses billed; supervisors, in-charges, CNO free; GST extra |
| `/cost-calculator` | `roi.astro` + `ROICalculatorWidget.svelte` | INR inputs and assumptions (section 6) |
| `/resources/nurse-duty-roster-template` | `resources/nurse-schedule-template.astro` + xlsx | Indian name, 3-shift template, INR-free (no money in the sheet) |
| `/contact` | `contact.astro` | Placeholders for endpoints |
| `/privacy`, `/terms`, `/404` | same | Indian entity placeholders, DPDP Act 2023 reference instead of the US healthcare-privacy law |

Dropped entirely: blog, articles, alternatives, about, founder pages,
proof-of-work, slides, statistics pages, RSS, unlisted, ask, pillar SEO pages,
`src/data/post`, `src/data/article`, `competitors.json`, `staffing-stats.ts`,
all SEO/publish gate scripts, `.publish/`, `docs/seo/`, `.claude/skills/`
from source, `pool-originals/`, videos.

Navigation: Home, How it works, Demo, Pricing, Resources (Cost calculator,
Roster template). Primary CTA: "Book a demo" (placeholder booking link). Secondary CTA: "Try the interactive demo" (/demo). Both appear in hero and closing CTA of every page. Footer: Product,
Resources, Company (Contact, Privacy, Terms). Footnote: "Built for Indian
hospitals."

## 4. Placeholders (single source of truth)

All external contact and capture values live in one file, `src/site.ts`, and
are imported everywhere. Each starts as a clearly marked `TODO_` value so the
build can grep for unfilled ones:

- `BOOKING_URL` (booking-page link or similar)
- `SUPPORT_EMAIL`
- `LEAD_CAPTURE_URL` (Apps Script or form endpoint) used by contact, demo, calculator
- `LEGAL_ENTITY_NAME`, `LEGAL_ADDRESS` (privacy/terms only, footer shows none)
- `GA_ID` (empty disables analytics), `GOOGLE_SITE_VERIFICATION` (empty)

A script `scripts/check-placeholders.mjs` fails `npm run build` if any
`TODO_` value is still present when `SITE_ENV=production`. Local builds warn
only.

## 5. Demo engine rework (`engine.ts`)

- Shift types: `morning` (07:00–15:00), `evening` (15:00–23:00), `night`
  (23:00–07:00). Seven days, 21 shifts.
- Seats per shift: morning = 1 in-charge + 2 staff nurses + 1 nursing
  assistant; evening = 1 in-charge + 2 staff nurses + 1 assistant; night =
  1 in-charge + 1 staff nurse + 1 assistant.
- Roles: `'Staff Nurse' | 'Nursing Assistant'`, with `inChargeQualified` on
  senior staff nurses (replaces charge-qualified RN). Credential label shown:
  "SN", "Sr SN", "NA".
- Hard rules (rename, keep mechanics): no double shift, minimum 12h rest
  between shifts (replaces the 12-hour-stretch rule), max 48 hours per week
  (replaces the US 40h weekly cap and maxHours60), one weekly off, no more than 6
  consecutive duty days, no evening-into-morning turnaround (a specific
  case of the rest rule, surfaced by name because CNOs know it), night
  rotation fairness, in-charge on every shift, skill mix holds.
- Employment: `full-time | contract`, contract replaces PRN; availability
  days keep the same mechanism.
- Roster: 17 staff with Indian names, mixed genders: 13 staff nurses (5
  in-charge qualified, 1 contract weekend-only, 1 on leave Wed–Thu) and 4
  nursing assistants. Night shift carries 1 in-charge + 1 staff nurse + 1
  assistant so 77 weekly seats fit 17 people at six duties each.
- Checklist labels and violation messages rewritten in Indian terms.
- Deterministic seed retained so the demo is reproducible.

## 6. Cost calculator assumptions (INR, per year)

Inputs (sliders) and defaults:

| Input | Default | Range |
|---|---|---|
| Ward in-charges (nurse in-charges) on the roster | 20 | 5–100 |
| Monthly cost of one in-charge (₹) | 45,000 | 25,000–1,00,000 |
| Share of an in-charge's time spent on rostering | 35% | 20–50% |
| Overtime hours per week across nursing staff | 200 | 0–1,000 |
| Contract (outsourced) nurse shifts per month | 60 | 0–400 |
| Nurse exits in past year where rostering was a factor | 12 | 0–100 |

Cost formulas (assumption constants in one object, cited in page copy as
"editable assumptions"; the constants are educated estimates approved by the
user on 2026-09-02, not sourced figures):

- In-charge time given back: in-charges × monthly cost × 12 × share
  (user input 2026-09-02: in-charges spend 30–40% of their job on rostering).
- Overtime premium: hours × 52 × ₹150 (premium over a ~₹200 per hour staff
  nurse base).
- Contract nurses: shifts × 8 h × ₹450 per hour × 12. No staffing-firm
  wording anywhere on the site (user ruling 2026-09-02).
- Attrition: exits × ₹1,20,000 replacement cost (recruitment, onboarding,
  contract cover during vacancy).

Output formatted in Indian digit grouping (₹12,34,567) via
`Intl.NumberFormat('en-IN')`. A short "these are estimates" note and a link
to pricing so the CNO can compare against ₹400 × nurse count × 12.

## 7. Template download

`public/downloads/SimpleRosterAI-Nurse-Duty-Roster-Template.xlsx`, generated
from the source workbook with: 3-shift columns (M/E/N/Off/Leave), weekly-hours
and 48h flag, consecutive-days flag, rest-gap flag, weekly-off check, coverage
per shift. Built by patching the source workbook with a Python script
(`scripts/build-template.py`, openpyxl) so formulas, named ranges, validations
and conditional formats survive; rerunnable. No currency in the sheet.

## 8. Technical plan

- Copy the source scaffold: `astro.config.ts`, `tailwind.config.js`,
  `tsconfig.json`, eslint/prettier, `src/assets`, `src/components/{ui,common,widgets}`
  (only the widgets the kept pages import), `src/layouts`, `src/utils`
  (minus blog/articles), `src/config.yaml`, `public/` (favicons, founders/gautham.png,
  downloads).
- Remove `@astrojs/rss`, `astro-embed`, blog content collection config, blog
  routes, `src/data`.
- Rename brand tokens: config.yaml site name, metadata, OG image regenerated
  as a simple branded PNG, Logo component text, schema.org Organization
  (founder: Gautham only), locale `en-IN`, currency INR in offers schema.
- `netlify.toml` trimmed to build + cache headers; drop all redirects.
  `vercel.json` kept as is. No analytics ID.
- Scripts kept: `dev`, `build` (with placeholder check), `preview`, `check`,
  `fix`, `smoke` (rewritten route list). All SEO/blog scripts dropped.
- Git: init locally, branch `main`, remote `https://github.com/GrowthToDo/srai-website`.
  Repo-local author set to `SimpleRosterAI <dev@simplerosterai.com>` so the
  public history carries no personal name. Pushing happens only on explicit
  user instruction.
- CLAUDE.md for this repo: product context, the no-footprint rule, the
  placeholder file, the Indian vocabulary table.

## 9. Testing and verification

- `npm run check` (astro check, eslint, prettier) clean.
- `npm run build` succeeds; `dist/` contains exactly the routes in section 3.
- Source-footprint gate: `node scripts/check-source.mjs` returns no hits (see CLAUDE.md Hard rules).
- Engine unit tests (`node --test`) for: 48h cap, 12h rest, weekly off,
  consecutive-days limit, in-charge coverage, skill mix, determinism.
- Browser pass on every route at desktop and mobile widths; demo runs a full
  week without console errors; calculator formats INR correctly.

## 10. Out of scope (later sessions)

SEO pillar pages, blog, competitor pages, analytics wiring, domain setup,
hosting deploy, launch video.
