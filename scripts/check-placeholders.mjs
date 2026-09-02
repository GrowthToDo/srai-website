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
