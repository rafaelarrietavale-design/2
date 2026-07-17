#!/usr/bin/env python3
"""Reduce Google Fonts CSS to latin (+thai for Noto) and inline woff2 as base64."""
import re, base64, subprocess, sys

CA = "/root/.ccr/ca-bundle.crt"
css = open("gfonts.css", encoding="utf-8").read()

# Split into (subset-comment, @font-face block)
pat = re.compile(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{.*?\})", re.S)
keep = {"latin", "thai"}
out_blocks = []
seen = 0
for m in pat.finditer(css):
    subset, block = m.group(1), m.group(2)
    fam = re.search(r"font-family:\s*'([^']+)'", block).group(1)
    # Noto Serif Thai -> keep thai; others -> keep latin
    want = "thai" if "Thai" in fam else "latin"
    if subset != want:
        continue
    url = re.search(r"url\((https://[^)]+\.woff2)\)", block).group(1)
    seen += 1
    r = subprocess.run(["curl", "-sS", "--cacert", CA, url], capture_output=True)
    if r.returncode != 0 or not r.stdout:
        print("FAIL", url, file=sys.stderr); sys.exit(1)
    b64 = base64.b64encode(r.stdout).decode()
    kb = len(r.stdout) / 1024
    new_src = f"src: url(data:font/woff2;base64,{b64}) format('woff2');"
    block2 = re.sub(r"src:\s*url\([^)]+\)\s*format\('woff2'\);", new_src, block)
    out_blocks.append(block2)
    print(f"  {fam} [{subset}] {kb:.0f}KB", file=sys.stderr)

result = "\n".join(out_blocks) + "\n"
open("fonts-inline.css", "w", encoding="utf-8").write(result)
print(f"kept {len(out_blocks)} faces -> fonts-inline.css ({len(result)/1024:.0f}KB with base64)", file=sys.stderr)
