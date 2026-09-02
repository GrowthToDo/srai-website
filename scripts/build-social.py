"""Generate the 1200x628 Open Graph image. Run: python scripts/build-social.py"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path("src/assets/images/social.png")
W, H = 1200, 628
img = Image.new("RGB", (W, H), (26, 35, 50))  # ink navy
d = ImageDraw.Draw(img)

def font(size):
    for name in ("georgia.ttf", "Georgia.ttf", "DejaVuSerif.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()

d.ellipse((1040, 60, 1140, 160), fill=(123, 175, 155))
d.text((80, 200), "SimpleRosterAI", font=font(84), fill=(250, 247, 242))
d.text((80, 320), "AI nurse duty rostering for Indian hospitals.", font=font(40), fill=(250, 247, 242))
d.text((80, 380), "The engine builds every ward roster. Your nursing office approves.", font=font(30), fill=(200, 205, 210))
d.text((80, 540), "simplerosterai.com", font=font(28), fill=(123, 175, 155))
OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, optimize=True)
print("wrote", OUT, img.size)
