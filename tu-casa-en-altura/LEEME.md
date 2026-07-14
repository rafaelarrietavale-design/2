# Tu Casa en Altura — Sitio web (Empire Enterprises)

Sitio web estático (HTML + CSS + JS, sin build ni dependencias) listo para subir a
Hostinger, Netlify o cualquier hosting. Optimizado para PC y celular.

## Cómo publicarlo

**Opción rápida (Hostinger / cPanel):**
1. Entrá al Administrador de Archivos de tu hosting, carpeta `public_html`.
2. Subí **todo el contenido** de esta carpeta (incluido el archivo oculto `.htaccess`).
3. Listo: abrí tu dominio en el navegador.

**Netlify:** arrastrá esta carpeta a https://app.netlify.com/drop

> Importante: subí también `.htaccess` (controla la caché en Hostinger). En el
> Administrador de Archivos activá "Mostrar archivos ocultos" para verlo.

## Ver el sitio en tu computadora

Doble clic en `index.html`. Para que se vean todos los efectos, es mejor abrirlo
desde un servidor local: en esta carpeta ejecutá `python -m http.server 8000` y
entrá a `http://localhost:8000`.

## Estructura

```
index.html        → la página (todo el contenido)
styles.css        → estilos
main.js           → animaciones e interacción
lib/              → librerías (GSAP) + datos de marca (manifest.js)
assets/img/       → imágenes y planos (formato .webp) + logo (.svg)
.htaccess         → configuración de caché para Hostinger
```

## Personalizar

- **Teléfono / WhatsApp:** editá el número en `index.html` (buscá `595991368222`)
  y en `lib/manifest.js`.
- **Precio, condiciones, textos:** están escritos directamente en `index.html`.
- **Logo:** el logo de Empire Enterprises está recreado como vector en
  `assets/img/emblem.svg` (nítido en cualquier tamaño). Si querés usar el
  archivo original de la desarrolladora, reemplazá `emblem.svg` por tu imagen
  (misma proporción cuadrada) o avisame y lo integro.
- **Ubicación (Google Maps):** reemplazá `assets/img/qr.webp` por el QR real y,
  si querés, agregá un mapa embebido en la sección Ubicación.

## Al hacer cambios

Si actualizás `styles.css` o `main.js`, subí la fecha del parámetro `?v=20260714`
en `index.html` (por ejemplo `?v=20260715`) para que los visitantes vean la
versión nueva sin problemas de caché.
```
