# ◆ Rafa Tracker

App personal (PWA) de **rutina de hábitos, organización del día y recompensas**, con un
**coach inteligente** que prioriza tus hábitos por urgencia. Estética minimalista en
**negro · dorado · blanco**. Funciona offline y guarda todos los datos **solo en tu dispositivo**.

## Cómo instalarla en tu iPhone

1. Abre la URL de la app en **Safari** (ver más abajo cómo publicarla).
2. Toca el botón **Compartir** (el cuadro con la flecha hacia arriba).
3. Elige **"Añadir a pantalla de inicio"**.
4. Toca **Añadir**. ¡Ya tienes el ícono de Rafa Tracker como una app más!

Ábrela desde el ícono para que se vea a pantalla completa, sin barra del navegador.

## Publicarla gratis con GitHub Pages

Esta app son solo archivos estáticos, así que se hospeda gratis en GitHub Pages:

1. En GitHub, entra a **Settings → Pages**.
2. En **Source**, elige **Deploy from a branch**.
3. Selecciona la rama `claude/rafa-tracker-ios-app-bkv8gf` (o `main` tras el merge) y la carpeta `/ (root)`.
4. Guarda. En 1–2 minutos tendrás una URL tipo `https://<usuario>.github.io/<repo>/`.
5. Abre esa URL en Safari en tu iPhone y sigue los pasos de instalación de arriba.

## Funciones

- **Hoy:** hábitos del día agrupados por franja (mañana / tarde / noche / cualquier momento),
  anillo de progreso, puntos y mejor racha.
- **Hábitos:** ícono y color propios, puntos por completar, días específicos o diarios, rachas 🔥.
- **Recompensas:** tienda donde canjeas puntos por premios que tú defines, con historial de canjes.
- **Progreso:** puntos, constancia de 7 días, mapa de calor de 4 semanas y rachas por hábito.
- **Coach:** botón "Ordena mis hábitos por urgencia", resumen del día y motivación.
  - **Modo local (gratis, sin conexión):** algoritmo propio que prioriza por rachas en riesgo,
    franja horaria y valor en puntos.
  - **Claude real (opcional):** en *Ajustes* puedes pegar tu API key de Anthropic para
    consejos conversacionales. La key se guarda solo en tu dispositivo.

## Datos y privacidad

- Todo se guarda en `localStorage` de tu iPhone. Nada se sube a ningún servidor.
- En *Ajustes* puedes **exportar** un respaldo `.json` e **importarlo** en otro dispositivo.

## Estructura

```
index.html              · estructura y navegación
css/styles.css          · tema negro/dorado/blanco
js/app.js               · toda la lógica (estado, vistas, coach)
sw.js                   · service worker (offline)
manifest.webmanifest    · configuración PWA
icons/                  · íconos de la app
```
