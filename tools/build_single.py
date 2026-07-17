#!/usr/bin/env python3
import base64, re, pathlib

root = pathlib.Path("/home/user/2")
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
gsap = (root / "lib/gsap.min.js").read_text(encoding="utf-8")
st = (root / "lib/ScrollTrigger.min.js").read_text(encoding="utf-8")
manifest = (root / "lib/manifest.js").read_text(encoding="utf-8")
main = (root / "main.js").read_text(encoding="utf-8")
fonts_css = pathlib.Path("/tmp/claude-0/-home-user-2/8a8345cd-5a26-54c4-ab16-b610a00dfeb1/scratchpad/fonts-inline.css").read_text(encoding="utf-8")

# 1. Inline images as data URIs
def data_uri(rel):
    p = root / rel
    b = base64.b64encode(p.read_bytes()).decode()
    return f"data:image/webp;base64,{b}"

img_map = {}
for p in sorted((root / "assets/img").glob("*.webp")):
    rel = "assets/img/" + p.name
    uri = data_uri(rel)
    img_map[rel] = uri
    html = html.replace(rel, uri)   # replaces literal refs in HTML/CSS

# 2. Inline preload -> drop (data uri preload is pointless / heavy in head)
html = re.sub(r'\s*<link rel="preload"[^>]*>', "", html)

# 2b. Remove external Google Fonts (preconnect + stylesheet) — fonts are inlined below
html = re.sub(r'\s*<link rel="preconnect"[^>]*>', "", html)
html = re.sub(r'\s*<link rel="stylesheet" href="https://fonts\.googleapis\.com[^"]*"\s*/?>', "", html)

# 3. Replace external stylesheet link with inline <style> (fonts first, then site CSS)
html = re.sub(r'\s*<link rel="stylesheet" href="styles\.css[^"]*"\s*/?>',
              lambda m: "\n  <style>\n" + fonts_css + "\n" + css + "\n  </style>", html)

# 4. Replace the four script tags block with inline scripts (+ inlined image map)
import json
img_script = "  <script>window.__IMG__=" + json.dumps(img_map) + ";</script>\n"
scripts_block = (
    img_script
    + "  <script>\n" + gsap + "\n  </script>\n"
    "  <script>\n" + st + "\n  </script>\n"
    "  <script>\n" + manifest + "\n  </script>\n"
    "  <script>\n" + main + "\n  </script>\n"
)
html = re.sub(
    r'  <script defer src="lib/gsap\.min\.js"></script>.*?<script defer src="main\.js[^"]*"></script>\n',
    lambda m: scripts_block, html, flags=re.S)

out = root / "sabai-madrid.html"
out.write_text(html, encoding="utf-8")
print("wrote", out, f"{out.stat().st_size/1024:.0f} KB")
# sanity
assert "styles.css" not in html, "css link remained"
assert 'src="lib/' not in html, "script src remained"
assert 'src="assets/img' not in html, "static <img> ref remained"
assert "url(assets/img" not in html and 'url("assets/img' not in html, "css url ref remained"
print("self-contained OK")
