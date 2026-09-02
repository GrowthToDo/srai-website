#!/usr/bin/env node
// Route set + banned-term gate over dist/. Exit 1 on any problem.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const ROUTES = [
  '',
  'how-it-works',
  'demo',
  'pricing',
  'cost-calculator',
  'resources/nurse-duty-roster-template',
  'contact',
  'privacy',
  'terms',
];

// Applied to every scanned file (.html, .js, .txt, .xml): identifying/competitor
// strings that must never appear anywhere in the built output.
const BANNED_EVERYWHERE = [
  /pradeep(?!@simplescheduleai\.com)/i, // the address is allowed; the name is not
  /pandey/i,
  /texas/i,
  /critical access/i,
  /(?<!@)simplescheduleai/i,
  /cal\.com/i,
  /covina/i,
];

// Applied only to copy files (.html, .txt, .xml) — NOT .js. Minified JS bundles
// (the demo engine, Svelte runtime, etc.) produce false positives for these
// word-shaped regexes, so they are excluded from this list.
const BANNED_COPY = [
  /\bCAHs?\b/,
  /\bFLSA\b/,
  /\bCMS\b/,
  /\bHIPAA\b/,
  /\$\d/,
  /\bDON\b/,
  /charge nurse/i,
  /\bRN\b/,
  /\bLPN\b/,
  /\bCNA\b/,
  /\bPRN\b/,
  /\bagency\b/i,
];

const problems = [];
for (const r of ROUTES) {
  const file = path.join(dist, r, 'index.html');
  if (!fs.existsSync(file)) problems.push(`missing route: /${r}`);
}
if (!fs.existsSync(path.join(dist, '404.html'))) problems.push('missing 404.html');
if (!fs.existsSync(path.join(dist, 'downloads', 'SimpleRosterAI-Nurse-Duty-Roster-Template.xlsx')))
  problems.push('missing template xlsx');

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|js|txt|xml)$/.test(e.name)) {
      const text = fs.readFileSync(p, 'utf8');
      const isCopy = /\.(html|txt|xml)$/.test(e.name);
      const patterns = isCopy ? [...BANNED_EVERYWHERE, ...BANNED_COPY] : BANNED_EVERYWHERE;
      for (const re of patterns) {
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
console.log(`smoke: OK (${ROUTES.length} routes, ${BANNED_EVERYWHERE.length + BANNED_COPY.length} banned patterns)`);
