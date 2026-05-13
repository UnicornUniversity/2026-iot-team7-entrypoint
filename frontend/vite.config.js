import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // všechny requesty na /api přepošle na backend
      '/api': 'https://two026-iot-team7-entrypoint.onrender.com',
    },
  },
})
