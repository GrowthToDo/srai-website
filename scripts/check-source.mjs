#!/usr/bin/env node
// Source-tree footprint gate: scans the repo's own files (not the built
// dist/) for the sibling-repo/personal-name footprint that scripts/smoke.mjs
// checks for in the built HTML. Complements smoke.mjs — smoke.mjs cannot see
// docs/, scripts/, or unbuilt source comments.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const SCAN_DIRS = ['docs', 'src', 'public', 'scripts'];
const EXTRA_FILES = ['CLAUDE.md', 'README.md', 'package.json'];
const EXCLUDE_FILES = new Set(
  ['scripts/smoke.mjs', 'scripts/build-template.py', 'scripts/check-source.mjs'].map((p) => path.resolve(p))
);

// This file is excluded from its own scan (like smoke.mjs), so the patterns
// can be written plainly.
const BANNED = [
  /pradeep/i,
  /pandey/i,
  /texas/i,
  /critical access/i,
  /\bCAH/,
  /\bFLSA\b/,
  /\bHIPAA\b/,
  /simplescheduleai/i,
  /cal\.com/i,
  /script\.google\.com/i,
  /covina/i,
  /\bagency\b/i,
];

const problems = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walk(full);
    } else if (entry.isFile()) {
      scanFile(full);
    }
  }
}

function scanFile(file) {
  const resolved = path.resolve(file);
  if (EXCLUDE_FILES.has(resolved)) return;
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    return; // binary/unreadable file (e.g. .xlsx) — skip
  }
  for (const re of BANNED) {
    const match = content.match(re);
    if (match) {
      problems.push(`${path.relative(ROOT, file)}: matched ${re} ("${match[0]}")`);
    }
  }
}

for (const dir of SCAN_DIRS) {
  const full = path.resolve(dir);
  if (fs.existsSync(full)) walk(full);
}
for (const file of EXTRA_FILES) {
  const full = path.resolve(file);
  if (fs.existsSync(full)) scanFile(full);
}

if (problems.length) {
  console.error('check-source: banned-string hits found:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log('check-source: clean.');
