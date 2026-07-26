import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLEFILE=1 produce un único index.html con todo el JS/CSS inlineado
// (para publicarlo como Artifact interactivo, sin servidor ni red).
const singleFile = process.env.SINGLEFILE === '1'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // En modo single-file desactivamos la PWA (el service worker necesita
    // ficheros y red aparte, que no aplican a un HTML autocontenido).
    ...(singleFile
      ? [viteSingleFile()]
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg'],
            manifest: {
              name: 'Descansa - Registro de sueño',
              short_name: 'Descansa',
              description: 'Registra tus horas exactas de sueño y mejora tu descanso.',
              theme_color: '#0b1020',
              background_color: '#0b1020',
              display: 'standalone',
              start_url: '/',
              icons: [
                {
                  src: 'favicon.svg',
                  sizes: 'any',
                  type: 'image/svg+xml',
                  purpose: 'any maskable',
                },
              ],
            },
          }),
        ]),
  ],
})
