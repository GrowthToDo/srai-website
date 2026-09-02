/**
 * Single source of truth for every external value on the site.
 * Values starting with TODO_ are placeholders; scripts/check-placeholders.mjs
 * fails a production build (SITE_ENV=production) while any remain in dist/.
 */
export const SITE_NAME = 'SimpleRosterAI';
export const SITE_URL = 'https://simplerosterai.com';

export const BOOKING_URL = 'TODO_BOOKING_URL';
export const SUPPORT_EMAIL = 'TODO_SUPPORT_EMAIL';
// Google Apps Script web app shared with the sibling site; rows carry a `source` field.
export const LEAD_CAPTURE_URL =
  'https://script.google.com/macros/s/AKfycbx5BZhSHWIljxWLWBPngX1CuHyIO4jvd3vQH-HYuPbgfPjj7kA8O4rhQoIHaK10RSJJ/exec';
export const LEGAL_ENTITY_NAME = 'TODO_LEGAL_ENTITY_NAME';
export const LEGAL_ADDRESS = 'TODO_LEGAL_ADDRESS';

export const PRICE_MONTHLY_INR = 400;
export const PRICE_ANNUAL_INR = 4000;

/** ₹12,34,567 — Indian digit grouping, no decimals. */
export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
