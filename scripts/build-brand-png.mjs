// Rasterise brand/*.svg into high-resolution PNGs (transparent background) plus
// navy and white "preview" PNGs for the light and dark versions.
// Run after scripts/build-brand.py:  node scripts/build-brand-png.mjs
// Needs Playwright (npm i --no-save playwright && npx playwright install chromium).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'brand';
const WIDTH = 3000; // px, long edge of each logo PNG
const jobs = [
  ['simplerosterai-logo', 'transparent'],
  ['simplerosterai-logo-tagline', 'transparent'],
  ['simplerosterai-logo-white', 'transparent'],
  ['simplerosterai-logo-tagline-white', 'transparent'],
  ['simplerosterai-logo-tagline', '#FFFFFF', 'on-white'],
  ['simplerosterai-logo-tagline-white', '#0B1F3A', 'on-navy'],
  ['simplerosterai-mark', 'transparent'],
  ['simplerosterai-app-icon', 'transparent', null, 1024],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, bg, suffix, size] of jobs) {
  const svg = fs.readFileSync(path.join(DIR, `${name}.svg`), 'utf8');
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
  const long = size ?? WIDTH;
  const scale = long / Math.max(w, h);
  const W = Math.round(w * scale);
  const H = Math.round(h * scale);
  await page.setViewportSize({ width: W, height: H });
  const sized = svg.replace(/width="[\d.]+" height="[\d.]+"/, '').replace('<svg ', `<svg width="${W}" height="${H}" `);
  await page.setContent(`<html><body style="margin:0;background:${bg}">${sized}</body></html>`);
  const out = path.join(DIR, `${name}${suffix ? '-' + suffix : ''}.png`);
  await page.screenshot({ path: out, omitBackground: bg === 'transparent', clip: { x: 0, y: 0, width: W, height: H } });
  console.log('wrote', out, `${W}x${H}`);
}
await browser.close();
