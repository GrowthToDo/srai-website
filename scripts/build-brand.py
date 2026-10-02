"""Build the brand kit into brand/: vector SVG logos (text converted to outlines) in four
versions: with and without tagline, for light and dark backgrounds, plus the icon.
Run: python scripts/build-brand.py   (then: node scripts/build-brand-png.mjs for PNGs)

Wordmark and tagline use Manrope ExtraBold (800) from the site's own font package, with the
font's pair kerning applied, so the outlines match what the site header renders.
"""
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FONT = Path("node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2")
OUT = Path("brand")

NAVY, TEAL, SAFFRON = "#0B1F3A", "#2AA79B", "#F5A623"
TEAL_INK, SAFFRON_INK, IVORY = "#1F8A80", "#A8620A", "#F7F8FA"
TAGLINE = "EVERY SHIFT. EVERY RULE. CHECKED."


def load_font(weight: int) -> TTFont:
    font = TTFont(str(FONT))
    return instancer.instantiateVariableFont(font, {"wght": weight})


def kerning_table(font: TTFont) -> dict[tuple[str, str], int]:
    """Collect pair adjustments (x advance) from GPOS PairPos lookups."""
    pairs: dict[tuple[str, str], int] = {}
    if "GPOS" not in font:
        return pairs
    gpos = font["GPOS"].table
    for lookup in gpos.LookupList.Lookup:
        subtables = []
        for st in lookup.SubTable:
            if lookup.LookupType == 9:  # extension
                st = st.ExtSubTable
            if st.LookupType == 2:
                subtables.append(st)
        for st in subtables:
            firsts = st.Coverage.glyphs
            if st.Format == 1:
                for i, first in enumerate(firsts):
                    for rec in st.PairSet[i].PairValueRecord:
                        v = getattr(rec.Value1, "XAdvance", 0) if rec.Value1 else 0
                        if v:
                            pairs.setdefault((first, rec.SecondGlyph), v)
            elif st.Format == 2:
                c1 = st.ClassDef1.classDefs if st.ClassDef1 else {}
                c2 = st.ClassDef2.classDefs if st.ClassDef2 else {}
                seconds = {g for g in font.getGlyphOrder()}
                for first in firsts:
                    row = st.Class1Record[c1.get(first, 0)]
                    for second in seconds:
                        rec = row.Class2Record[c2.get(second, 0)]
                        v = getattr(rec.Value1, "XAdvance", 0) if rec.Value1 else 0
                        if v:
                            pairs.setdefault((first, second), v)
    return pairs


class Typesetter:
    def __init__(self, weight: int):
        self.font = load_font(weight)
        self.glyphs = self.font.getGlyphSet()
        self.cmap = self.font.getBestCmap()
        self.upem = self.font["head"].unitsPerEm
        self.cap = self.font["OS/2"].sCapHeight
        self.kern = kerning_table(self.font)

    def run(self, text: str, size: float, tracking: float = 0.0):
        """Return (glyph name, x in font units) for each glyph and the advance width in px."""
        scale = size / self.upem
        names = [self.cmap[ord(ch)] for ch in text]
        out, x = [], 0.0
        for i, name in enumerate(names):
            out.append((name, x))
            x += self.glyphs[name].width
            if i + 1 < len(names):
                x += self.kern.get((name, names[i + 1]), 0) + tracking * self.upem
        return out, x * scale

    def path(self, text: str, x0: float, baseline: float, size: float, tracking: float = 0.0) -> tuple[str, float]:
        scale = size / self.upem
        placed, width = self.run(text, size, tracking)
        parts = []
        for name, gx in placed:
            pen = SVGPathPen(self.glyphs)
            # font units are y-up; flip into SVG's y-down space
            self.glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x0 + gx * scale, baseline)))
            d = pen.getCommands()
            if d:
                parts.append(d)
        return " ".join(parts), width


def mark(x: float, y: float, h: float, check: str) -> str:
    """Three shift cells, 74x22 design units, scaled to height h."""
    k = h / 22
    cells = "".join(
        f'<rect x="{x + cx * k:.2f}" y="{y:.2f}" width="{22 * k:.2f}" height="{22 * k:.2f}" rx="{6 * k:.2f}" fill="{fill}"/>'
        for cx, fill in ((0, TEAL), (26, TEAL), (52, SAFFRON))
    )
    pts = [(58, 11.4), (61.7, 15), (68.3, 7.5)]
    d = "M" + " L".join(f"{x + px * k:.2f} {y + py * k:.2f}" for px, py in pts)
    tick = (
        f'<path d="{d}" fill="none" stroke="{check}" stroke-width="{2.9 * k:.2f}" '
        'stroke-linecap="round" stroke-linejoin="round"/>'
    )
    return cells + tick


def lockup(dark_ground: bool, with_tagline: bool) -> str:
    word = Typesetter(800)
    tag = Typesetter(700)
    size = 100.0  # wordmark size in px
    cap_px = word.cap * size / word.upem
    pad = 40.0
    mark_h = 0.86 * cap_px * 1.08
    gap = 0.34 * size
    base_text, ai_text = "SimpleRoster", "AI"

    top = pad
    mark_y = top
    baseline = mark_y + mark_h / 2 + cap_px / 2  # centre the caps on the mark
    text_x = pad + mark_h * 74 / 22 + gap
    d_base, w_base = word.path(base_text, text_x, baseline, size)
    kern_ai = word.kern.get((word.cmap[ord("r")], word.cmap[ord("A")]), 0) * size / word.upem
    d_ai, w_ai = word.path(ai_text, text_x + w_base + kern_ai, baseline, size)
    right = text_x + w_base + kern_ai + w_ai
    bottom = baseline + 0.06 * size

    text_fill = IVORY if dark_ground else NAVY
    ai_fill = TEAL if dark_ground else TEAL_INK
    body = mark(pad, mark_y, mark_h, NAVY)
    body += f'<path d="{d_base}" fill="{text_fill}"/><path d="{d_ai}" fill="{ai_fill}"/>'

    if with_tagline:
        tag_size = 0.285 * size
        tag_base = baseline + 0.62 * size
        d_tag, w_tag = tag.path(TAGLINE, pad, tag_base, tag_size, tracking=0.18)
        body += f'<path d="{d_tag}" fill="{SAFFRON if dark_ground else SAFFRON_INK}"/>'
        right = max(right, pad + w_tag)
        bottom = tag_base

    width, height = right + pad, bottom + pad
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.0f} {height:.0f}" '
        f'width="{width:.0f}" height="{height:.0f}" role="img" aria-label="SimpleRosterAI">{body}</svg>'
    )


def icon(ground: bool) -> str:
    """The mark alone; on a navy rounded square when ground=True."""
    if ground:
        return Path("public/icon.svg").read_text(encoding="utf-8")
    h, pad = 22.0, 4.0
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {74 + 2 * pad:.0f} {h + 2 * pad:.0f}">'
        f"{mark(pad, pad, h, NAVY)}</svg>"
    )


OUT.mkdir(exist_ok=True)
files = {
    "simplerosterai-logo.svg": lockup(dark_ground=False, with_tagline=False),
    "simplerosterai-logo-tagline.svg": lockup(dark_ground=False, with_tagline=True),
    "simplerosterai-logo-white.svg": lockup(dark_ground=True, with_tagline=False),
    "simplerosterai-logo-tagline-white.svg": lockup(dark_ground=True, with_tagline=True),
    "simplerosterai-mark.svg": icon(ground=False),
    "simplerosterai-app-icon.svg": icon(ground=True),
}
for name, svg in files.items():
    (OUT / name).write_text(svg, encoding="utf-8")
    print("wrote", OUT / name)
