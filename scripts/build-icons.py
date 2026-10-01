"""Generate favicon SVG/PNGs and app icons from the three-cell mark. Run: python scripts/build-icons.py

The mark: three shift cells (morning, evening, night) on navy, the last one saffron and checked.
"""
from pathlib import Path
from PIL import Image, ImageDraw

NAVY = (11, 31, 58)
TEAL = (42, 167, 155)
SAFFRON = (245, 166, 35)

# 48x48 canvas: three 13px cells, 2.5px gaps, centred.
CELL, GAP, RX = 13.0, 2.5, 3.6
X0 = (48 - (3 * CELL + 2 * GAP)) / 2
Y0 = (48 - CELL) / 2


def cell_x(i: int) -> float:
    return X0 + i * (CELL + GAP)


def check_points(x: float, y: float, s: float) -> list[tuple[float, float]]:
    return [(x + s * 0.27, y + s * 0.52), (x + s * 0.44, y + s * 0.68), (x + s * 0.74, y + s * 0.34)]


def svg() -> str:
    cells = "".join(
        f'<rect x="{cell_x(i):.2f}" y="{Y0:.2f}" width="{CELL}" height="{CELL}" rx="{RX}" fill="{fill}"/>'
        for i, fill in enumerate(["#2AA79B", "#2AA79B", "#F5A623"])
    )
    pts = " ".join(f"{px:.2f} {py:.2f}" for px, py in check_points(cell_x(2), Y0, CELL))
    tick = (
        f'<polyline points="{pts}" fill="none" stroke="#0B1F3A" stroke-width="{CELL * 0.14:.2f}" '
        'stroke-linecap="round" stroke-linejoin="round"/>'
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">'
        f'<rect width="48" height="48" rx="10" fill="#0B1F3A"/>{cells}{tick}</svg>'
    )


def png(size: int, path: Path) -> None:
    k = size * 8 / 48  # supersample scale
    s = round(48 * k)
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, s - 1, s - 1), radius=round(10 * k), fill=NAVY)
    for i, fill in enumerate([TEAL, TEAL, SAFFRON]):
        x = cell_x(i) * k
        d.rounded_rectangle((x, Y0 * k, x + CELL * k, (Y0 + CELL) * k), radius=round(RX * k), fill=fill)
    pts = [(px * k, py * k) for px, py in check_points(cell_x(2), Y0, CELL)]
    w = round(CELL * 0.14 * k)
    d.line(pts, fill=NAVY, width=w, joint="curve")
    for px, py in (pts[0], pts[-1]):
        d.ellipse((px - w / 2, py - w / 2, px + w / 2, py + w / 2), fill=NAVY)
    im = im.resize((size, size), Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, optimize=True)


SVG = svg()
for p in [Path("src/assets/favicons/favicon.svg"), Path("public/icon.svg")]:
    p.write_text(SVG, encoding="utf-8")
png(180, Path("src/assets/favicons/apple-touch-icon.png"))
png(180, Path("public/apple-touch-icon.png"))
png(192, Path("public/icon-192.png"))
png(512, Path("public/icon-512.png"))
ico = Image.open("public/icon-512.png").convert("RGBA")
ico.save("src/assets/favicons/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
ico.save("public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("icons written")
