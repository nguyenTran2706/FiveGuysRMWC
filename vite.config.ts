import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', port: 5173, strictPort: true,
    // Local synthesis includes large model caches and Python environments.
    // They are never app inputs; polling them delays even small MP3 requests.
    watch: { usePolling: true, interval: 300, ignored: ['**/.tools/**'] },
    proxy: { '/api': { target: process.env.RIGHTS_API_URL || 'http://127.0.0.1:8787', changeOrigin: true } },
  },
});
