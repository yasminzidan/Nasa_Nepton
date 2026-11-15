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
      '/api/chat': {
        target: `http://127.0.0.1:${chatApiPort}`,
        changeOrigin: true,
      },
      '/api/fires': {
        target: 'https://wildfire-api-fgccbkhzg4ekbfc6.italynorth-01.azurewebsites.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
