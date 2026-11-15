import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const chatApiPort = process.env.GROQ_PROXY_PORT || '8787';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': `http://127.0.0.1:${chatApiPort}`,
    },
  },
});
