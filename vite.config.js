import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      // In dev, the frontend runs on 5173 and the backend on 3000 (`npm run
      // server`) - proxy API calls so the app can use relative /api paths in
      // both dev and the single-container production build.
      '/api': 'http://localhost:3000',
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Dunia Ceria - Game Anak',
        short_name: 'Dunia Ceria',
        description: 'Game belajar logika, matematika, dan Bahasa Inggris untuk anak',
        theme_color: '#ff6f91',
        background_color: '#aee9ff',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        skipWaiting: true,
        clientsClaim: true,
      }
    })
  ]
})
