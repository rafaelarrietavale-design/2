#!/usr/bin/env python3
"""
Generador de texturas atmosféricas para SABAI (dev-only, no se despliega).
Crea fondos WebP cálidos tipo "luz de restaurante" — sin fotos, sin derechos.
Requiere Pillow.
"""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops

random.seed(41)
OUT = "assets/img"

def clamp(v): return max(0, min(255, int(v)))

def radial_glow(size, cx, cy, radius, color, strength=1.0):
    """Devuelve una capa RGB con un halo radial suave."""
    w, h = size
    layer = Image.new("RGB", size, (0, 0, 0))
    px = layer.load()
    r0, g0, b0 = color
    inv = 1.0 / max(1.0, radius)
    for y in range(h):
        dy = (y - cy)
        for x in range(w):
            dx = (x - cx)
            d = math.sqrt(dx * dx + dy * dy) * inv
            if d >= 1:
                continue
            f = (1 - d)
            f = f * f * strength
            px[x, y] = (clamp(r0 * f), clamp(g0 * f), clamp(b0 * f))
    return layer

def add_grain(img, amount=10):
    w, h = img.size
    noise = Image.effect_noise((w, h), amount).convert("L")
    noise_rgb = Image.merge("RGB", (noise, noise, noise))
    return ImageChops.overlay(img, noise_rgb)

def vignette(img, strength=0.85):
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([-w*0.25, -h*0.25, w*1.25, h*1.25], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) * 0.18))
    dark = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.composite(img, dark, mask.point(lambda p: clamp(p * strength + 255*(1-strength))))

def compose(size, base, glows, grain=9, vig=0.9, blur=0):
    img = Image.new("RGB", size, base)
    for g in glows:
        layer = radial_glow(size, *g)
        img = ImageChops.add(img, layer)
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    img = vignette(img, vig)
    img = add_grain(img, grain)
    return img

def save(img, name, q=80):
    path = f"{OUT}/{name}.webp"
    img.save(path, "WEBP", quality=q, method=6)
    print("wrote", path, img.size)

# ---- HERO: mesa cálida a media luz, brasas de oro y laca roja ---------------
W, H = 2000, 1250
hero = compose((W, H), (16, 11, 8), [
    (int(W*0.62), int(H*0.42), int(W*0.55), (150, 96, 40), 1.0),   # oro central
    (int(W*0.20), int(H*0.72), int(W*0.42), (120, 40, 26), 0.85),  # laca roja
    (int(W*0.88), int(H*0.80), int(W*0.36), (90, 62, 30), 0.7),    # ámbar borde
    (int(W*0.45), int(H*0.10), int(W*0.30), (70, 52, 30), 0.55),   # brillo alto
], grain=8, vig=0.82)
save(hero, "hero", q=82)

# ---- EMBER: panel para sección de filosofía (rojo/oro profundo) -------------
W, H = 1600, 1100
ember = compose((W, H), (20, 12, 9), [
    (int(W*0.30), int(H*0.40), int(W*0.55), (140, 60, 34), 0.9),
    (int(W*0.80), int(H*0.66), int(W*0.45), (120, 88, 40), 0.7),
], grain=9, vig=0.9)
save(ember, "texture-ember")

# ---- SMOKE: panel frío-cálido para contacto/mapa ----------------------------
W, H = 1600, 1000
smoke = compose((W, H), (14, 12, 11), [
    (int(W*0.65), int(H*0.35), int(W*0.5), (96, 78, 52), 0.75),
    (int(W*0.20), int(H*0.75), int(W*0.4), (70, 40, 30), 0.6),
], grain=10, vig=0.92)
save(smoke, "texture-smoke")

# ---- CTA: banda de reserva, oro cálido intenso ------------------------------
W, H = 1800, 800
cta = compose((W, H), (22, 13, 9), [
    (int(W*0.5), int(H*0.5), int(W*0.5), (160, 100, 44), 1.0),
    (int(W*0.15), int(H*0.6), int(W*0.35), (130, 46, 28), 0.7),
    (int(W*0.85), int(H*0.5), int(W*0.35), (120, 82, 36), 0.7),
], grain=8, vig=0.8)
save(cta, "texture-cta")

print("done")
