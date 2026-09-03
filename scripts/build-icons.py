"""Generate favicon SVG/PNGs and app icons from the duty-wheel mark. Run: python scripts/build-icons.py"""
from pathlib import Path
from PIL import Image, ImageDraw

NAVY = (11, 31, 58)
SAFFRON = (245, 166, 35)
SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#0B1F3A"/><circle cx="24" cy="24" r="15" fill="none" stroke="#F7F8FA" stroke-opacity="0.18" stroke-width="6"/><path d="M24 9 A15 15 0 0 1 37 16.5" fill="none" stroke="#F5A623" stroke-width="6" stroke-linecap="round"/><path d="M37 31.5 A15 15 0 0 1 24 39" fill="none" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-opacity="0.75"/><path d="M11 31.5 A15 15 0 0 1 11 16.5" fill="none" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-opacity="0.5"/><circle cx="24" cy="24" r="3.5" fill="#F7F8FA"/></svg>"""

def png(size: int, path: Path) -> None:
    s = size * 4  # supersample
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, s, s), radius=s * 10 // 48, fill=NAVY)
    r = s * 15 // 48
    c = s // 2
    w = s * 6 // 48
    box = (c - r, c - r, c + r, c + r)
    d.arc(box, 0, 360, fill=(247, 248, 250, 46), width=w)
    d.arc(box, -90, -30, fill=SAFFRON, width=w)
    d.arc(box, 30, 90, fill=SAFFRON + (191,), width=w)
    d.arc(box, 150, 210, fill=SAFFRON + (128,), width=w)
    dot = s * 3.5 / 48
    d.ellipse((c - dot, c - dot, c + dot, c + dot), fill=(247, 248, 250))
    im = im.resize((size, size), Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, optimize=True)

for p in [Path("src/assets/favicons/favicon.svg"), Path("public/icon.svg")]:
    p.write_text(SVG, encoding="utf-8")
png(180, Path("src/assets/favicons/apple-touch-icon.png"))
png(180, Path("public/apple-touch-icon.png"))
png(192, Path("public/icon-192.png"))
png(512, Path("public/icon-512.png"))
ico = Image.open("public/icon-192.png").convert("RGBA")
ico.save("src/assets/favicons/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
ico.save("public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("icons written")
