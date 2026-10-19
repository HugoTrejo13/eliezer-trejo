import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // three.js va en su propio chunk diferido (Planet.jsx); ~250 KB gzip es lo esperado
  build: { chunkSizeWarningLimit: 1000 },
})
