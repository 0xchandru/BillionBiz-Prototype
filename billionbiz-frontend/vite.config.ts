import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import fs from 'node:fs'

const packageJson = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/realtime': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
})
