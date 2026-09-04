/**
 * Wraps a short phrase (two words at most) in a hand-drawn circle that is
 * stroked once on first paint. Returns an HTML string for `set:html` titles.
 * The phrase is kept on one line; do not circle anything longer.
 */
const PATH =
  'M24,60 C16,30 92,10 168,9 C256,8 307,27 305,55 C303,86 234,102 148,100 C68,98 17,83 16,58 C15,37 54,21 110,15';

export function circle(text: string): string {
  return (
    `<span class="circ">${text}` +
    `<svg class="circ-svg" aria-hidden="true" viewBox="0 0 320 110" preserveAspectRatio="none">` +
    `<path d="${PATH}" pathLength="1" /></svg></span>`
  );
}
