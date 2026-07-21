# Nicolás con K Electricidad — Sitio web

Sitio web estático (HTML + CSS + JavaScript). **No necesita instalar nada**: es
una carpeta que se sube tal cual a Hostinger, Netlify, Vercel o cualquier hosting.

## 📱 Cambiar tu teléfono, WhatsApp, correo e Instagram

Abrí el archivo **`lib/manifest.js`** y editá solo los valores entre comillas.
Ahí está tu número de WhatsApp, el correo y el Instagram. Se actualizan en todo
el sitio de una sola vez. No hace falta tocar nada más.

```
phoneRaw: "5493510000000"   ← código país (54) + 9 + área + número, SOLO números
phoneDisplay: "+54 351 000-0000"   ← cómo se ve en pantalla
```

## 🖼️ Poner tus fotos reales de obras

La sección **“Trabajos”** hoy usa piezas gráficas hechas a medida. Para reemplazarlas
por fotos tuyas:

1. Dejá tus fotos (JPG o PNG) en la carpeta `assets/photos/source/`.
2. Avisá y las integramos con el tamaño y recorte correctos.

Ideal: 4 a 6 fotos de tableros, iluminación, cableado y mediciones.

## 🚀 Publicar el sitio

- **Hostinger:** entrá al Administrador de archivos → carpeta `public_html` →
  subí **todo el contenido** de esta carpeta (incluido el archivo `.htaccess`).
- **Netlify / Vercel:** arrastrá esta carpeta a la pantalla de “deploy”.

## 📁 Qué es cada cosa

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La página. Acá está todo el texto. |
| `styles.css` | Los colores y el diseño. |
| `main.js` | Animaciones y el botón de WhatsApp. |
| `lib/manifest.js` | **Tus datos de contacto** (editá acá). |
| `.htaccess` | Configuración del servidor (dejalo como está). |
| `assets/` | Ícono e imágenes. |

## ✅ Datos a completar antes de publicar

- [ ] Teléfono / WhatsApp real en `lib/manifest.js`
- [ ] Correo e Instagram reales en `lib/manifest.js`
- [ ] Matrícula profesional (opcional, se puede mostrar en el pie)
- [ ] Fotos reales de obras
- [ ] Revisar años de experiencia y cantidad de obras (en `index.html`, sección “números”)
