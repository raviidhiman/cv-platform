import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/resume': 'http://localhost:5000',
      '/user': 'http://localhost:5000',
      '/ai': 'http://localhost:5000',
    }
  },
  build: { outDir: 'dist' },
  publicDir: 'public',
})