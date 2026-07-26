# 🌙 Descansa — App de registro de sueño

App web (PWA) para registrar tus **horas exactas de sueño**, controlar tu deuda de
sueño y mejorar tu descanso. Construida con las mejores herramientas **gratuitas**
de diseño y desarrollo.

Tiene una **versión gratuita con publicidad** y una **versión Premium sin anuncios
por 4,99 $/mes**, además de **pagos** y **formulario de contacto**.

---

## ✨ Funciones

- **Registro en vivo:** botones _Ir a dormir_ / _Ya desperté_ con cronómetro y marca de horas exactas.
- **Siestas** además del sueño nocturno.
- **Edición manual** de cualquier registro (fecha, hora, calidad, factores, notas), con manejo del cruce de medianoche.
- **Dashboard** con resumen de la última noche, media semanal, gráfico de tendencia.
- **Estadísticas:** horas por día, hora media de acostarse/despertar (promedio circular), y más.
- **Deuda de sueño** acumulada frente a tu objetivo.
- **Puntuación de consistencia** (qué tan regulares son tus horarios).
- **Recordatorio de hora de dormir** con notificaciones web.
- **Objetivo de sueño** y **temas** configurables.
- **PWA** instalable y con soporte offline.

### Gratis vs Premium (4,99 $/mes)

| Función | Gratis | Premium |
| --- | :---: | :---: |
| Registro y estadísticas 7 días | ✅ | ✅ |
| Anuncios | Sí | **No** |
| Estadísticas 30 días | — | ✅ |
| Historial ilimitado | — | ✅ |
| Exportar CSV | — | ✅ |
| Temas exclusivos | — | ✅ |

---

## 🧱 Stack (todo gratuito)

- **Vite + React + TypeScript**
- **Tailwind CSS** (diseño, tema oscuro propio)
- **React Router**, **Recharts** (gráficos), **lucide-react** (iconos)
- **vite-plugin-pwa** (instalable + offline)
- **Firebase** (Auth + Firestore) — opcional
- **EmailJS** — opcional (contacto por email)

---

## 🚀 Empezar

```bash
npm install
npm run dev      # abre http://localhost:5173
npm run build    # compila TypeScript + build de producción
npm run preview  # sirve el build
```

**La app funciona sin configurar nada:** sin credenciales usa un backend **local**
(`localStorage`) con autenticación simulada, ideal para probar todo el flujo.

---

## 🔌 Pasar de MVP a producción

Copia `.env.example` a `.env` y rellena lo que quieras activar:

### 1. Firebase (cuentas + nube)
Crea un proyecto en [Firebase Console](https://console.firebase.google.com), activa
**Authentication (Email/Password)** y **Firestore**, y pega las 6 variables
`VITE_FIREBASE_*`. La app detecta la config y cambia al `FirebaseAdapter`
automáticamente (ver `src/data/store.ts`). Estructura en Firestore:

```
users/{uid}                      -> perfil
users/{uid}/sessions/{sessionId} -> sesiones de sueño
contactMessages/{id}             -> mensajes de contacto
```

### 2. Pagos con Stripe (el MVP usa pago simulado)
El flujo de suscripción está aislado en `src/pages/Premium.tsx` y
`src/context/ProfileContext.tsx` (`subscribePremium`). Para cobrar de verdad:
1. Crea un producto de 4,99 $/mes en [Stripe](https://stripe.com).
2. Añade Stripe Checkout + una función serverless (p. ej. Firebase Functions o la
   extensión oficial _Run Payments with Stripe_) que cree la sesión de pago y
   confirme la suscripción por webhook.
3. Sustituye `handleSubscribe` para redirigir a Checkout y marca `premium` solo
   tras confirmar el webhook.

### 3. Anuncios con Google AdSense
Pon tu `VITE_ADSENSE_CLIENT` (`ca-pub-...`) y añade el script de AdSense en
`index.html`. El componente `src/components/AdSlot.tsx` ya renderiza unidades
`<ins class="adsbygoogle">` cuando hay cliente configurado, y se **oculta en Premium**.

### 4. Contacto por email (EmailJS)
Rellena las variables `VITE_EMAILJS_*`. Los mensajes se guardan siempre en el
DataStore y, si EmailJS está configurado, además se envían a tu correo
(`src/lib/emailjs.ts`).

---

## 📁 Estructura

```
src/
  data/        # capa de datos con adaptadores (local / firebase)
  context/     # Auth, Profile (suscripción/ajustes), Sleep
  lib/         # sleepMath (cálculos), notifications, emailjs
  components/  # AdSlot, SessionEditor, SessionCard, StatCard, Layout...
  pages/       # Dashboard, Track, History, Stats, Premium, Contact, Settings, Auth
```

---

> ⚠️ El MVP usa **pago simulado** (no realiza cargos reales) y un backend local por
> defecto. Sigue los pasos de arriba para conectar Firebase, Stripe y AdSense reales.
