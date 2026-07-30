# Tatu Travel — sitio web

Sitio de **Tatu Travel**, agencia de viajes boutique especializada en Brasil
(Rio de Janeiro · Pipa · Florianópolis · Lençóis Maranhenses).

Es un **sitio estático premium**: HTML + CSS + JavaScript vanilla, **sin build,
sin npm, sin frameworks**. Se puede subir tal cual a Hostinger, Netlify, Vercel,
GitHub Pages o cualquier hosting estático (arrastrar la carpeta y listo).

## Estructura

```
index.html          # una sola página (long-scroll) con todas las secciones
styles.css          # sistema de diseño + todas las secciones (paleta bandera de Brasil)
main.js             # comportamiento (splash, reveals, nav, marquee, opiniones, formulario, WhatsApp)
favicon.svg         # ícono: tatú carreta
.htaccess           # cache + MIME + gzip para Hostinger/Apache
lib/
  gsap.min.js       # animaciones (opcional; el sitio funciona sin ellas)
  ScrollTrigger.min.js
  manifest.js       # window.__BRAND__: contacto y destinos (editar acá el WhatsApp/email)
assets/img/         # acá van las fotos (hero, sobre-nosotros, cada destino, experiencias)
tools/              # scripts dev-only (conversión a WebP, verificación). No se despliegan.
```

## Cómo editar el contacto

Abrí `lib/manifest.js` y completá tus datos reales en `contact`:

```js
whatsapp: "5491123456789",         // solo dígitos, formato internacional
whatsappDisplay: "+54 9 11 2345-6789",
email: "hola@tatutravel.com",
instagram: "tatu.travel",
```

Se propagan automáticamente al botón flotante, a los CTA de cada destino, al
formulario y al footer.

## Fotos

El sitio arranca con **placeholders con marca**. Para poner fotos reales,
dejá los archivos en `assets/img/` y reemplazá el `<div class="ph …">`
correspondiente por `<img src="assets/img/archivo.webp" alt="…">`. Cada bloque
tiene un `data-slot` (`hero`, `about`, `rio-1`, `pipa-1`, `maranhao-1`, `exp-1`…)
para ubicarlo fácil.

Para convertir fotos a WebP: `python tools/webp_convert.py --src <carpeta> --dst assets/img`.

## Ver el sitio en local

```bash
python3 -m http.server 8765
# abrir http://localhost:8765
```

## Paleta (bandera de Brasil)

`#009C3B` verde · `#FFDF00` amarillo · `#002776` azul · blanco/arena.
