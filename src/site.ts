/**
 * Single source of truth for every external value on the site.
 * Values starting with TODO_ are placeholders; scripts/check-placeholders.mjs
 * fails a production build (SITE_ENV=production) while any remain in dist/.
 */
export const SITE_NAME = 'SimpleRosterAI';
export const SITE_URL = 'https://simplerosterai.com';

export const BOOKING_URL = 'https://cal.com/gautham-8bdvdx/30min';
export const SUPPORT_EMAIL = 'support@simplerosterai.com';
// Google Apps Script web app shared with the sibling site; rows carry a `source` field.
export const LEAD_CAPTURE_URL =
  'https://script.google.com/macros/s/AKfycbx5BZhSHWIljxWLWBPngX1CuHyIO4jvd3vQH-HYuPbgfPjj7kA8O4rhQoIHaK10RSJJ/exec';
export const LEGAL_ENTITY_NAME = 'SimpleRosterAI';
export const LEGAL_ADDRESS = '';

/**
 * Pricing is by licensed beds, never by nurse count. Two plans per band:
 * Roster (manual grid, rule checks, approval, exports) and Engine (everything
 * in Roster plus autofill drafts, replacement ranking, NABH audit pack, nurse
 * phone portal, guided setup). Annual prices in INR, GST extra. Monthly
 * billing is one tenth of the annual price (two months free on annual).
 */
export interface PriceBand {
  /** shown to the visitor */
  label: string;
  /** upper bound of the band, inclusive; Infinity for the top band */
  maxBeds: number;
  /** Roster plan, per year */
  roster: number;
  /** Engine plan, per year */
  engine: number;
}

export const PRICE_BANDS: PriceBand[] = [
  { label: 'Up to 100 beds', maxBeds: 100, roster: 60_000, engine: 2_10_000 },
  { label: '101 to 200 beds', maxBeds: 200, roster: 1_20_000, engine: 4_20_000 },
  { label: '201 to 300 beds', maxBeds: 300, roster: 1_80_000, engine: 6_30_000 },
  { label: '301 to 500 beds', maxBeds: 500, roster: 2_70_000, engine: 9_20_000 },
  { label: 'Over 500 beds', maxBeds: Infinity, roster: 3_60_000, engine: 12_00_000 },
];

/** Hospital groups on one contract: discount on every site. */
export const GROUP_DISCOUNTS = [
  { minSites: 3, percent: 15 },
  { minSites: 6, percent: 25 },
];

/** Monthly billing: one tenth of the annual price. */
export function monthlyFromAnnual(annual: number): number {
  return Math.round(annual / 10);
}

/** The band a hospital of `beds` licensed beds falls in. */
export function bandForBeds(beds: number): PriceBand {
  return PRICE_BANDS.find((b) => beds <= b.maxBeds) ?? PRICE_BANDS[PRICE_BANDS.length - 1];
}

/** One-line pricing summary for meta descriptions and CTAs. */
export const PRICE_SUMMARY =
  'Priced by licensed beds, not by nurses. Roster from ₹60,000 a year, Engine from ₹2,10,000 a year, GST extra.';

/** ₹12,34,567 — Indian digit grouping, no decimals. */
export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
