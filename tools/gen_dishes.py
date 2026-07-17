#!/usr/bin/env python3
"""
Ilustraciones a color de cada plato para SABAI (dev-only).
Vista cenital tipo flat-lay: bol/plato + comida + ingredientes con colores
reales. Obra original, libre de derechos. Requiere Pillow.
Genera assets/img/dish-<id>.webp (referencia visual por plato).
"""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops

OUT = "assets/img"
S = 3                      # supersample
W = 560 * S               # working size
random.seed(7)

def C(hexs, a=255):
    hexs = hexs.lstrip("#")
    return (int(hexs[0:2],16), int(hexs[2:4],16), int(hexs[4:6],16), a)

def radial(size, inner, outer, cx=0.5, cy=0.42):
    small = 110
    g = Image.new("RGB", (small, small))
    px = g.load()
    r = small * 0.62
    ri, gi, bi = inner[:3]; ro, go, bo = outer[:3]
    for y in range(small):
        for x in range(small):
            d = math.hypot(x - cx*small, y - cy*small) / r
            d = max(0.0, min(1.0, d))
            px[x,y] = (int(ri+(ro-ri)*d), int(gi+(go-gi)*d), int(bi+(bo-bi)*d))
    return g.resize((size, size), Image.LANCZOS)

def new_layer():
    return Image.new("RGBA", (W, W), (0,0,0,0))

def blob(dr, cx, cy, rx, ry, fill, outline=None, w=0):
    dr.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=fill, outline=outline, width=w)

def soft_shadow(base, cx, cy, rx, ry, blur, alpha=120):
    sh = new_layer(); d = ImageDraw.Draw(sh)
    d.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=(0,0,0,alpha))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(sh)

def bowl(base, cx, cy, R, rim, inner, food_inner, food_outer, food_r, plate=False):
    # drop shadow
    soft_shadow(base, cx, cy+18*S, R*1.02, R*0.98, 26*S, 150)
    # ceramic
    grad = radial(R*2, C(rim), C(inner)).convert("RGBA")
    mask = Image.new("L", (R*2, R*2), 0)
    ImageDraw.Draw(mask).ellipse([0,0,R*2,R*2], fill=255)
    base.paste(grad, (cx-R, cy-R), mask)
    # rim highlight ring
    ring = new_layer(); d = ImageDraw.Draw(ring)
    d.ellipse([cx-R, cy-R, cx+R, cy+R], outline=C(rim, 150), width=max(2,int(3*S)))
    d.ellipse([cx-R+6*S, cy-R+6*S, cx+R-6*S, cy+R-6*S], outline=(255,255,255,26), width=max(1,int(2*S)))
    base.alpha_composite(ring.filter(ImageFilter.GaussianBlur(1.2*S)))
    # food surface
    if food_inner:
        fg = radial(food_r*2, C(food_inner), C(food_outer), 0.42, 0.4).convert("RGBA")
        fm = Image.new("L", (food_r*2, food_r*2), 0)
        ImageDraw.Draw(fm).ellipse([0,0,food_r*2,food_r*2], fill=255)
        base.paste(fg, (cx-food_r, cy-food_r), fm)

def sheen(base, cx, cy, R):
    s = new_layer(); d = ImageDraw.Draw(s)
    d.ellipse([cx-R*0.7, cy-R*0.78, cx+R*0.1, cy-R*0.15], fill=(255,255,255,20))
    base.alpha_composite(s.filter(ImageFilter.GaussianBlur(14*S)))

def grain(base, amt=7):
    n = Image.effect_noise((W, W), amt).convert("L")
    n = Image.merge("RGBA", (n,n,n, Image.new("L",(W,W),20)))
    base.alpha_composite(n)

def finish(base, name):
    bg = Image.new("RGBA", (W, W), C("1b140e"))
    # subtle warm vignette bg
    bg = Image.alpha_composite(bg, radial(W, C("241a12"), C("140e09"), 0.5, 0.46).convert("RGBA"))
    bg.alpha_composite(base)
    grain(bg)
    out = bg.convert("RGB").resize((560,560), Image.LANCZOS)
    p = f"{OUT}/dish-{name}.webp"
    out.save(p, "WEBP", quality=82, method=6)
    print("wrote", p)

CX, CY = W//2, int(W*0.5)
def scatter(dr, n, cx, cy, spread, rmin, rmax, fill, outline=None):
    for _ in range(n):
        a = random.uniform(0, math.tau); rr = random.uniform(0, spread)
        x = cx + math.cos(a)*rr; y = cy + math.sin(a)*rr*0.9
        r = random.uniform(rmin, rmax)
        dr.ellipse([x-r,y-r,x+r,y+r], fill=fill, outline=outline, width=int(1.5*S) if outline else 0)

def chili_ring(dr, x, y, r, col="c0392b"):
    dr.ellipse([x-r,y-r,x+r,y+r], fill=C(col))
    dr.ellipse([x-r*0.5,y-r*0.5,x+r*0.5,y+r*0.5], fill=C("e7c9a0"))
    scatter(dr, 5, x, y, r*0.4, 1.2*S, 2.2*S, C("6d2018"))

def cilantro(dr, x, y, s):
    for _ in range(4):
        a=random.uniform(0,math.tau); dx=math.cos(a)*s; dy=math.sin(a)*s
        dr.polygon([(x,y),(x+dx-3*S,y+dy),(x+dx+3*S,y+dy),(x+dx,y+dy+5*S)], fill=C("4f7a35"))
    dr.ellipse([x-2*S,y-2*S,x+2*S,y+2*S], fill=C("3f6a2e"))

def lime_wedge(dr, x, y, r):
    dr.pieslice([x-r,y-r,x+r,y+r], 200, 340, fill=C("9ac24a"), outline=C("d9e8a8"), width=int(2*S))
    dr.pieslice([x-r*0.8,y-r*0.8,x+r*0.8,y+r*0.8], 205, 335, fill=C("c7dd78"))

# ---------------------------------------------------------------- 1 PHAD THAI
def phad_thai():
    b = new_layer(); d = ImageDraw.Draw(b)
    bowl(b, CX, CY, int(W*0.42), "3a2c1e", "1c130c", "c07a34", "9a5a24", int(W*0.36))
    d = ImageDraw.Draw(b)
    # noodles: curved ribbons
    for i in range(46):
        a = random.uniform(0, math.tau); rr = random.uniform(0, W*0.32)
        x = CX + math.cos(a)*rr; y = CY + math.sin(a)*rr*0.92
        col = random.choice(["cf8b41","b56d2b","d89b52","a85f24"])
        ang = random.uniform(0, math.pi); ln = random.uniform(30*S, 70*S)
        x2 = x+math.cos(ang)*ln; y2 = y+math.sin(ang)*ln*0.6
        xm = (x+x2)/2 + random.uniform(-16*S,16*S); ym=(y+y2)/2 - random.uniform(8*S,26*S)
        d.line([x,y,xm,ym,x2,y2], fill=C(col), width=int(random.uniform(3.5*S,5.5*S)), joint="curve")
    # egg / tofu cubes
    for _ in range(6):
        x=CX+random.uniform(-W*0.28,W*0.28); y=CY+random.uniform(-W*0.24,W*0.26)
        s=random.uniform(14*S,20*S); d.rounded_rectangle([x,y,x+s,y+s], radius=4*S, fill=C("e8c96a"))
    # prawn
    px,py=CX-W*0.12, CY-W*0.16
    d.arc([px-46*S,py-30*S,px+46*S,py+60*S], 200, 20, fill=C("e08a5a"), width=int(20*S))
    for k in range(5):
        d.arc([px-46*S,py-30*S,px+46*S,py+60*S], 200+k*20, 210+k*20, fill=C("c96a3f"), width=int(20*S))
    scatter(d, 60, CX, CY, W*0.32, 2.4*S, 4.0*S, C("d9b877"))   # peanuts
    for _ in range(5): cilantro(d, CX+random.uniform(-W*0.26,W*0.26), CY+random.uniform(-W*0.24,W*0.24), 10*S)
    lime_wedge(d, CX+W*0.22, CY+W*0.2, 40*S)
    sheen(b, CX, CY, int(W*0.42)); finish(b, "phad-thai")

# ---------------------------------------------------------------- 2 GREEN CURRY
def green_curry():
    b = new_layer(); d = ImageDraw.Draw(b)
    bowl(b, CX, CY, int(W*0.42), "3a2c1e", "1c130c", "83a457", "5c7a3c", int(W*0.36))
    d = ImageDraw.Draw(b)
    scatter(d, 30, CX, CY, W*0.3, 6*S, 10*S, C("9cbb63"))       # coconut/oil sheen bubbles
    for _ in range(7):  # chicken
        x=CX+random.uniform(-W*0.26,W*0.26); y=CY+random.uniform(-W*0.24,W*0.24)
        s=random.uniform(22*S,30*S); d.rounded_rectangle([x,y,x+s,y+s*0.8], radius=8*S, fill=C("dcc79c"), outline=C("c2ab7c"), width=int(2*S))
    for _ in range(6):  # thai eggplant spheres
        x=CX+random.uniform(-W*0.28,W*0.28); y=CY+random.uniform(-W*0.24,W*0.26); r=random.uniform(13*S,17*S)
        d.ellipse([x-r,y-r,x+r,y+r], fill=C("8fae5e"), outline=C("6f8f45"), width=int(2*S))
        d.ellipse([x-r*0.4,y-r*0.5,x-r*0.05,y-r*0.1], fill=C("cfe0a0"))
    for _ in range(8):  # basil leaves
        x=CX+random.uniform(-W*0.28,W*0.28); y=CY+random.uniform(-W*0.24,W*0.24)
        d.polygon([(x,y-12*S),(x+8*S,y),(x,y+12*S),(x-8*S,y)], fill=C("35682a"))
    for _ in range(5): chili_ring(d, CX+random.uniform(-W*0.24,W*0.24), CY+random.uniform(-W*0.22,W*0.24), 9*S)
    # coconut cream swirl
    d.arc([CX-W*0.2,CY-W*0.2,CX+W*0.2,CY+W*0.2], 30, 200, fill=C("eae2cf"), width=int(6*S))
    sheen(b, CX, CY, int(W*0.42)); finish(b, "green-curry")

# ---------------------------------------------------------------- 3 TOM YUM
def tom_yum():
    b = new_layer(); d = ImageDraw.Draw(b)
    bowl(b, CX, CY, int(W*0.42), "3a2c1e", "1c130c", "d0662f", "a5401f", int(W*0.36))
    d = ImageDraw.Draw(b)
    scatter(d, 40, CX, CY, W*0.32, 3*S, 7*S, C("e58a3e"))       # oil droplets
    # mushrooms
    for _ in range(6):
        x=CX+random.uniform(-W*0.26,W*0.26); y=CY+random.uniform(-W*0.24,W*0.24); r=random.uniform(16*S,22*S)
        d.pieslice([x-r,y-r,x+r,y+r], 180, 360, fill=C("e6d8b8"), outline=C("c9b892"), width=int(2*S))
        d.line([x-r,y,x+r,y], fill=C("c9b892"), width=int(2*S))
    # lemongrass + galangal sticks
    for _ in range(4):
        x=CX+random.uniform(-W*0.24,W*0.24); y=CY+random.uniform(-W*0.22,W*0.22)
        ang=random.uniform(0,math.pi); ln=60*S
        d.line([x,y,x+math.cos(ang)*ln,y+math.sin(ang)*ln], fill=C("b7c07a"), width=int(7*S))
    # prawn
    px,py=CX+W*0.02, CY-W*0.14
    d.arc([px-50*S,py-34*S,px+50*S,py+64*S], 190, 30, fill=C("ef925c"), width=int(22*S))
    for k in range(6): d.arc([px-50*S,py-34*S,px+50*S,py+64*S], 190+k*18, 200+k*18, fill=C("d06a3c"), width=int(22*S))
    for _ in range(6): chili_ring(d, CX+random.uniform(-W*0.26,W*0.26), CY+random.uniform(-W*0.24,W*0.24), 9*S)
    for _ in range(6): cilantro(d, CX+random.uniform(-W*0.26,W*0.26), CY+random.uniform(-W*0.24,W*0.24), 10*S)
    lime_wedge(d, CX-W*0.22, CY+W*0.2, 38*S)
    sheen(b, CX, CY, int(W*0.42)); finish(b, "tom-yum")

# ---------------------------------------------------------------- 4 SOM TAM
def som_tam():
    b = new_layer(); d = ImageDraw.Draw(b)
    bowl(b, CX, CY, int(W*0.42), "463527", "241a12", None, None, 0)
    d = ImageDraw.Draw(b)
    # shredded papaya pile
    for _ in range(120):
        a=random.uniform(0,math.tau); rr=random.uniform(0, W*0.30)
        x=CX+math.cos(a)*rr; y=CY+math.sin(a)*rr*0.9
        ang=random.uniform(-0.5,0.5); ln=random.uniform(30*S,64*S)
        col=random.choice(["cdd39c","d9dcae","b9c47e","e0e2c0"])
        d.line([x,y,x+math.cos(ang)*ln,y+math.sin(ang)*ln*0.4], fill=C(col), width=int(random.uniform(3*S,5*S)))
    # tomato wedges
    for _ in range(5):
        x=CX+random.uniform(-W*0.26,W*0.26); y=CY+random.uniform(-W*0.22,W*0.24); r=random.uniform(18*S,24*S)
        d.pieslice([x-r,y-r,x+r,y+r], random.randint(0,180), random.randint(200,360), fill=C("c53d2c"), outline=C("e26a4a"), width=int(2*S))
    # long beans
    for _ in range(6):
        x=CX+random.uniform(-W*0.24,W*0.24); y=CY+random.uniform(-W*0.22,W*0.22); ang=random.uniform(0,math.pi)
        d.line([x,y,x+math.cos(ang)*70*S,y+math.sin(ang)*70*S], fill=C("5f8a3c"), width=int(8*S))
    scatter(d, 40, CX, CY, W*0.28, 2.6*S, 4*S, C("d9b877"))
    for _ in range(5): chili_ring(d, CX+random.uniform(-W*0.24,W*0.24), CY+random.uniform(-W*0.22,W*0.24), 8*S)
    sheen(b, CX, CY, int(W*0.42)); finish(b, "som-tam")

# ---------------------------------------------------------------- 5 SATAY
def satay():
    b = new_layer(); d = ImageDraw.Draw(b)
    bowl(b, CX, CY, int(W*0.42), "463527", "241a12", None, None, 0)
    d = ImageDraw.Draw(b)
    # 3 skewers
    for i,(oy) in enumerate([-W*0.16, 0, W*0.16]):
        x0=CX-W*0.3; y0=CY+oy+ i*0
        x1=CX+W*0.3; y1=CY+oy-W*0.06
        d.line([x0,y0,x1,y1], fill=C("b79463"), width=int(6*S))
        # char cubes
        for t in range(4):
            f=0.18+t*0.2; x=x0+(x1-x0)*f; y=y0+(y1-y0)*f
            s=30*S
            d.rounded_rectangle([x-s,y-s*0.7,x+s,y+s*0.7], radius=8*S, fill=C("b5722e"), outline=C("7a4a1e"), width=int(2*S))
            for cc in range(3):
                d.line([x-s+10*S*cc,y-s*0.7,x-s+10*S*cc,y+s*0.7], fill=C("6a3f19", 120), width=int(2*S))
            d.ellipse([x-s*0.5,y-s*0.5,x,y-s*0.1], fill=C("d79a4e"))
    # peanut sauce bowl
    bx,by=CX+W*0.24, CY+W*0.26; br=48*S
    d.ellipse([bx-br,by-br,bx+br,by+br], fill=C("8a5a2c"), outline=C("caa06a"), width=int(3*S))
    d.ellipse([bx-br*0.9,by-br*0.9,bx+br*0.9,by+br*0.9], fill=C("7a4a24"))
    d.ellipse([bx-br*0.4,by-br*0.5,bx-br*0.05,by-br*0.15], fill=C("a9743a"))
    # cucumber
    for _ in range(4):
        x=CX+random.uniform(-W*0.28,-W*0.1); y=CY+random.uniform(0.1*W,0.28*W); r=16*S
        d.ellipse([x-r,y-r,x+r,y+r], fill=C("bcd47a"), outline=C("8fb45a"), width=int(2*S))
        d.ellipse([x-r*0.5,y-r*0.5,x+r*0.5,y+r*0.5], fill=C("dcecb0"))
    sheen(b, CX, CY, int(W*0.42)); finish(b, "satay")

# ---------------------------------------------------------------- 6 SPRING ROLLS
def spring_rolls():
    b = new_layer(); d = ImageDraw.Draw(b)
    bowl(b, CX, CY, int(W*0.42), "463527", "241a12", None, None, 0)
    d = ImageDraw.Draw(b)
    # 3 fresh rolls (translucent)
    for i,(ox,oy,ang) in enumerate([(-W*0.14,-W*0.02,-0.5),(0.02*W,0.08*W,-0.35),(W*0.16,-W*0.14,-0.6)]):
        cx=CX+ox; cy=CY+oy; L=W*0.34; wdt=54*S
        dx=math.cos(ang); dy=math.sin(ang)
        x0=cx-dx*L/2; y0=cy-dy*L/2; x1=cx+dx*L/2; y1=cy+dy*L/2
        d.line([x0,y0,x1,y1], fill=C("e7e9d8"), width=int(wdt))
        d.line([x0,y0,x1,y1], fill=C("f2f3e6"), width=int(wdt*0.5))
        # inner veg dots along
        for t in range(7):
            f=t/6.0; x=x0+(x1-x0)*f; y=y0+(y1-y0)*f
            col=random.choice(["e07b3a","5f8a3c","e08a6a","d9c04a"])
            d.ellipse([x-6*S,y-6*S,x+6*S,y+6*S], fill=C(col))
        # cut ends
        d.ellipse([x1-wdt*0.5,y1-wdt*0.5,x1+wdt*0.5,y1+wdt*0.5], outline=C("cfd2ba"), width=int(2*S))
    # dip bowl (tamarind)
    bx,by=CX+W*0.22, CY+W*0.26; br=46*S
    d.ellipse([bx-br,by-br,bx+br,by+br], fill=C("5a3018"), outline=C("caa06a"), width=int(3*S))
    d.ellipse([bx-br*0.4,by-br*0.5,bx-br*0.05,by-br*0.15], fill=C("7a4526"))
    for _ in range(4): cilantro(d, CX+random.uniform(-W*0.26,W*0.26), CY+random.uniform(-W*0.24,W*0.24), 10*S)
    sheen(b, CX, CY, int(W*0.42)); finish(b, "spring-rolls")

# ---------------------------------------------------------------- 7 MASSAMAN
def massaman():
    b = new_layer(); d = ImageDraw.Draw(b)
    bowl(b, CX, CY, int(W*0.42), "3a2c1e", "1c130c", "9a5a2f", "6e3c1e", int(W*0.36))
    d = ImageDraw.Draw(b)
    scatter(d, 30, CX, CY, W*0.3, 5*S, 9*S, C("b06e38"))
    # beef chunks
    for _ in range(6):
        x=CX+random.uniform(-W*0.24,W*0.24); y=CY+random.uniform(-W*0.22,W*0.22); s=random.uniform(26*S,34*S)
        d.rounded_rectangle([x,y,x+s,y+s*0.85], radius=9*S, fill=C("5e3418"), outline=C("452510"), width=int(2*S))
        d.ellipse([x+s*0.15,y+s*0.1,x+s*0.5,y+s*0.4], fill=C("7a4a26"))
    # potato cubes
    for _ in range(5):
        x=CX+random.uniform(-W*0.26,W*0.24); y=CY+random.uniform(-W*0.22,W*0.24); s=random.uniform(24*S,30*S)
        d.rounded_rectangle([x,y,x+s,y+s], radius=6*S, fill=C("dcb45a"), outline=C("c39a44"), width=int(2*S))
    scatter(d, 40, CX, CY, W*0.28, 3*S, 5*S, C("d9b877"))       # peanuts
    # star anise
    sx,sy=CX-W*0.02, CY-W*0.02
    for k in range(8):
        ang=k*math.pi/4
        x=sx+math.cos(ang)*30*S; y=sy+math.sin(ang)*30*S
        d.ellipse([x-8*S,y-8*S,x+8*S,y+8*S], fill=C("4a2c14"))
    d.ellipse([sx-9*S,sy-9*S,sx+9*S,sy+9*S], fill=C("6a3f1e"))
    # cinnamon stick
    d.line([CX+W*0.12,CY-W*0.2,CX+W*0.22,CY-W*0.04], fill=C("7a4a24"), width=int(12*S))
    sheen(b, CX, CY, int(W*0.42)); finish(b, "massaman")

# ---------------------------------------------------------------- 8 MANGO RICE
def mango_rice():
    b = new_layer(); d = ImageDraw.Draw(b)
    bowl(b, CX, CY, int(W*0.42), "463527", "241a12", None, None, 0)
    d = ImageDraw.Draw(b)
    # sticky rice mound
    rx,ry=CX-W*0.14, CY+W*0.04
    d.ellipse([rx-W*0.16,ry-W*0.12,rx+W*0.16,ry+W*0.14], fill=C("efe9d8"), outline=C("d8d1bd"), width=int(2*S))
    scatter(d, 90, rx, ry, W*0.13, 2*S, 3.4*S, C("fbf7ec"))     # grains
    # mango slices fan
    mx,my=CX+W*0.12, CY-W*0.02
    for i,off in enumerate([-52*S,-18*S,16*S,50*S]):
        x=mx+off*0.5; y=my+abs(off)*0.15
        d.pieslice([x-70*S,y-40*S,x+70*S,y+90*S], 210, 330, fill=C("edb43a"), outline=C("f2cf6a"), width=int(3*S))
        d.pieslice([x-60*S,y-32*S,x+60*S,y+78*S], 216, 324, fill=C("f2c65a"))
    # coconut cream drizzle
    for _ in range(5):
        x=CX+random.uniform(-W*0.2,W*0.16); y=CY+random.uniform(-W*0.18,W*0.2)
        d.arc([x-30*S,y-14*S,x+30*S,y+30*S], 20, 200, fill=C("f4efe0"), width=int(5*S))
    scatter(d, 40, rx, ry, W*0.12, 1.6*S, 2.6*S, C("c9b86a"))   # mung bean topping
    sheen(b, CX, CY, int(W*0.42)); finish(b, "mango-rice")

for f in [phad_thai, green_curry, tom_yum, som_tam, satay, spring_rolls, massaman, mango_rice]:
    f()
print("done")
