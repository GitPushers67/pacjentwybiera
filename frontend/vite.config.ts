import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/pacjentwybiera/',
  server: {
    proxy: {
      '/wp-json': {
        target: 'https://pacjentwybiera.pl',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
