# SimpleRosterAI — Claude Project Instructions

## Product context

SimpleRosterAI: AI nurse duty rostering software for Indian hospitals. Buyer: the
CNO or Nursing Superintendent of a 300+ bed hospital or hospital group. Product
pricing: ₹400 per nurse per month, ₹4,000 per nurse per year, GST extra; only
nurses are billed. Frame everything from hospital nursing operations, not generic
tech.

Sibling of a US site for a different hospital market with its own name, vocabulary
and managed-service pricing. Do not import its market framing, vocabulary, pages
or blog.

## Hard rules

- The support address pradeep@simplescheduleai.com is allowed by user decision; the name itself is not.
- No personal name other than Gautham appears anywhere: site, schema, images,
  docs, comments, git history. `scripts/smoke.mjs` enforces the banned list.
- Every external value (booking link, email, capture endpoint, legal entity,
  prices) lives in `src/site.ts`. Pages import it; nothing is hard-coded.
- `TODO_` placeholders in `src/site.ts` block a production build
  (`SITE_ENV=production npm run build`).
- Vocabulary: duty roster, ward, in-charge, staff nurse, nursing assistant,
  absence, contract nurse, weekly off, 48-hour week, 12-hour rest. Three 8-hour
  shifts: morning 07:00–15:00, evening 15:00–23:00, night 23:00–07:00.
- Never use the term for outsourced-staffing firms; say contract or outsourced nurses. Nurse in-charges
  spend 30–40% of their time on rostering; that is the first calculator line.
- Currency INR with Indian grouping via `formatINR`. Always "GST extra" next to a price.
- CTAs: primary "Book a demo" (`BOOKING_URL`), secondary "Try the interactive demo" (`/demo`).
- `scripts/smoke.mjs`, `scripts/check-source.mjs` and `scripts/build-template.py` necessarily contain the
  banned patterns themselves (and the source workbook's path) to define and
  enforce the gate; they are excluded from the source-tree grep gate.

## Commands

- `npm run dev`, `npm run build`, `npm run check`, `npm run fix`
- `npm test` — engine tests (`src/components/demo-scheduler/engine.test.ts`)
- `npm run smoke` — route set and banned terms over `dist/`, then the source-tree footprint gate
- `npm run smoke:src` — source-tree footprint gate only (`scripts/check-source.mjs`, scans `docs/`, `src/`, `public/`, `scripts/`, `CLAUDE.md`, `README.md`, `package.json`)
- `python scripts/build-template.py` — regenerate the roster template xlsx
- `python scripts/build-social.py` — regenerate the OG image

## Layout

| What                | Where                                                             |
| ------------------- | ----------------------------------------------------------------- |
| Pages               | `src/pages/`                                                      |
| Site values         | `src/site.ts`                                                     |
| Demo engine + tests | `src/components/demo-scheduler/`                                  |
| Calculator          | `src/components/widgets/CostCalculatorWidget.svelte`              |
| Spec                | `docs/superpowers/specs/2026-09-02-simplerosterai-site-design.md` |
| Plan                | `docs/superpowers/plans/2026-09-02-simplerosterai-site.md`        |

## Git

Repo-local author is `SimpleRosterAI <dev@simplerosterai.com>`; never commit with a
personal identity. Push only when explicitly asked.
