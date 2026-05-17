import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // všechny requesty na /api přepošle na backend
      '/api': 'https://2026-iot-team7-entrypoint.fly.dev',
    },
  },
})
