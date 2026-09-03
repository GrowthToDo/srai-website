"""Generate the 1200x628 Open Graph image on navy with the duty-wheel mark. Run: python scripts/build-social.py"""
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

# mark
c, r, w = (140, 140), 52, 18
box = (c[0] - r, c[1] - r, c[0] + r, c[1] + r)
d.arc(box, 0, 360, fill=(60, 78, 104), width=w)
d.arc(box, -90, -30, fill=SAFFRON, width=w)
d.arc(box, 30, 90, fill=(214, 146, 36), width=w)
d.arc(box, 150, 210, fill=(160, 112, 40), width=w)
d.ellipse((c[0] - 12, c[1] - 12, c[0] + 12, c[1] + 12), fill=IVORY)
d.text((220, 105), "SimpleRosterAI", font=font(64), fill=IVORY)
d.text((80, 290), "Your in-charges spend a third of their", font=font(46), fill=IVORY)
d.text((80, 350), "week on the duty roster.", font=font(46), fill=IVORY)
d.text((80, 410), "Get it back.", font=font(46), fill=SAFFRON)
d.text((80, 540), "AI nurse duty rostering for Indian hospitals  ·  simplerosterai.com", font=font(26, bold=False), fill=MUTED)
OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, optimize=True)
print("wrote", OUT, img.size)
