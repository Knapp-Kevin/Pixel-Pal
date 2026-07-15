import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['pixel-pals-icon.svg', 'pixel-pals-maskable.svg'],
      manifest: {
        name: 'Pixel Pals',
        short_name: 'Pixel Pals',
        description: 'A storybook world where every friendship changes the world.',
        theme_color: '#315b4c',
        background_color: '#f7f1df',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        scope: '/',
        categories: ['games', 'education', 'kids'],
        icons: [
          {
            src: '/pixel-pals-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/pixel-pals-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html'
      }
    })
  ],
  server: {
    host: true
  }
});
