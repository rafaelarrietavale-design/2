# Pulso

Asistente fitness inteligente (PWA). No es un tracker más: **conecta** tus datos
—entrenamiento, sueño, energía— y te devuelve *por qué* rendís como rendís. El
diferenciador es la interpretación, no el registro.

> Estado: **MVP · Capa 1**. Este push cubre **fundación + design system + Home de muestra**.
> Corre 100% con datos mock (sin credenciales). Ver el resto del roadmap abajo.

## Stack

- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend/DB** (pendiente de conectar): Supabase (Postgres + Auth)
- **IA** (pendiente): API de Anthropic (Claude) para el insight semanal
- **Pagos** (pendiente): Stripe
- **Hosting**: Vercel · **PWA**: manifest + service worker (pendiente)

## Correr en local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción
```

No hacen falta credenciales: mientras `.env.local` no tenga `VITE_SUPABASE_URL`,
la app usa la capa mock (`src/data/mock.js`). Para conectar servicios reales, copiá
`.env.example` a `.env.local` y completá las claves.

## Dos direcciones de diseño (para elegir)

Esta entrega incluye **dos direcciones visuales completas** de la Home, alternables con
el switcher superior ("Vista de diseño"). Ambas nacen del mundo fitness real y evitan los
clichés de IA (crema+terracota, negro+verde ácido, estilo periódico).

- **Instrumento** — la app como una lectura de instrumento; calma e inteligente.
  Firma: *el trazo*, una sola curva que teje sueño+energía+entreno de la semana. Light-first.
- **Zona / Heat** — adrenalina y foco; superficie oscura de "training floor".
  Firma: *medidor de zona del día* (rampa de zonas fría→caliente). Dark-first.

Tipografía compartida: **Archivo Expanded** (display) · **Inter** (texto) ·
**JetBrains Mono / Space Mono** (datos, como lectura de instrumento).
Tokens en `src/styles/tokens.css` (`:root[data-dir="instrumento"|"zona"]`).

Cuando se elija una dirección, se congela: se borra la otra Home y el switcher.

## Estructura

```
src/
  data/mock.js          # daily_logs de varias semanas + helpers (fecha, readiness, zona, agrupación)
  lib/dataClient.js     # única puerta a datos (lee/escribe): hoy mock+localStorage, mañana Supabase
  lib/insight.js        # insight semanal por reglas + prompt de Claude para el wiring real
  styles/               # tokens.css (design system) · components.css
  components/           # ZoneMeter · Scale · Toggle · Stepper · Choice · StatTile · TabBar · Logo
  screens/              # HomeZona · Onboarding · RegistroDiario · Historial · InsightSemanal · Perfil
  App.jsx main.jsx
public/                 # ícono (svg + png), maskable, favicon, manifest.webmanifest
```

Marca/PWA: ícono propio de Pulso (onda de pulso con la rampa de zonas) instalable desde Safari
(*Añadir a inicio*). Service worker con precache + runtime caching de fuentes → funciona offline.

## Roadmap (orden de construcción)

- [x] 1. Setup (React + Vite + Tailwind) + capa de datos mock
- [x] 2. Token system de diseño (dirección **Zona/Heat** congelada)
- [x] 3. Onboarding (objetivo → nivel → días)
- [x] 4. Registro diario (pantalla core)
- [x] 5. Home/Dashboard (Zona/Heat)
- [x] 6. Historial (por semana)
- [x] 7. Insight semanal — **por reglas (simulado)**; falta cambiar `generateInsight()` por la
       llamada real a Claude desde una edge function (prompt y payload ya listos en `lib/insight.js`)
- [x] 8. Perfil/Configuración
- [x] 9. PWA — ícono, manifest instalable, service worker + offline. Pendiente: self-host de
       fuentes (hoy se cachean en runtime) e íconos de splash por dispositivo iOS
- [x] 10. Stripe — paywall Pulso Premium + gate de features (**checkout simulado**, sin cobrar ni
       pedir tarjeta); `lib/billing.js` deja el punto de swap para la Checkout Session real de Stripe

**MVP (Capa 1) completo.** Próximo paso para producción: conectar servicios reales (Supabase,
edge function con Claude, Checkout de Stripe) llenando `.env.local` — la UI no cambia.

Fuera de alcance del MVP (Capa 2/3): escaneo de comida por foto, rutina desde foto del
gym, comparación fotográfica de progreso, componente social.
