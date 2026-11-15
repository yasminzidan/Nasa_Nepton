import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import cesium from 'vite-plugin-cesium'
import tailwindcss from '@tailwindcss/vite'

const chatApiPort = process.env.GROQ_PROXY_PORT || '8787'

export default defineConfig({
  plugins: [react(), tailwindcss(), cesium()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      '/api': `http://127.0.0.1:${chatApiPort}`,
    },
  },
})
