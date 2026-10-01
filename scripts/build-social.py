"""Generate the 1200x628 Open Graph image on navy with the three-cell mark. Run: python scripts/build-social.py"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path("src/assets/images/social.png")
W, H = 1200, 628
NAVY, IVORY, SAFFRON, MUTED = (11, 31, 58), (247, 248, 250), (245, 166, 35), (170, 180, 195)
img = Image.new("RGB", (W, H), NAVY)
d = ImageDraw.Draw(img)

def font(size, bold=True):
    for name in (("arialbd.ttf" if bold else "arial.ttf"), "DejaVuSans-Bold.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()

# mark: three shift cells, the last saffron and checked
TEAL = (42, 167, 155)
x, y, cell, gap = 80, 112, 46, 9
for i, fill in enumerate([TEAL, TEAL, SAFFRON]):
    cx = x + i * (cell + gap)
    d.rounded_rectangle((cx, y, cx + cell, y + cell), radius=12, fill=fill)
tx = x + 2 * (cell + gap)
tick = [(tx + cell * 0.27, y + cell * 0.52), (tx + cell * 0.44, y + cell * 0.68), (tx + cell * 0.74, y + cell * 0.34)]
d.line(tick, fill=NAVY, width=7, joint="curve")
d.text((x + 3 * cell + 2 * gap + 26, 100), "SimpleRoster", font=font(64), fill=IVORY)
w_base = d.textlength("SimpleRoster", font=font(64))
d.text((x + 3 * cell + 2 * gap + 26 + w_base, 100), "AI", font=font(64), fill=TEAL)
d.text((80, 196), "EVERY SHIFT. EVERY RULE. CHECKED.", font=font(24), fill=SAFFRON)
d.text((80, 290), "Your in-charges spend a third of their", font=font(46), fill=IVORY)
d.text((80, 350), "week on the duty roster.", font=font(46), fill=IVORY)
d.text((80, 410), "Get it back.", font=font(46), fill=SAFFRON)
d.text((80, 540), "AI nurse duty rostering for Indian hospitals  ·  simplerosterai.com", font=font(26, bold=False), fill=MUTED)
OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, optimize=True)
print("wrote", OUT, img.size)
