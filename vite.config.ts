import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [react(), tailwindcss()], server: { host: '0.0.0.0', port: 5173, strictPort: true, watch: { usePolling: true, interval: 300 }, proxy: { '/api': { target: process.env.RIGHTS_API_URL || 'http://127.0.0.1:8787', changeOrigin: true } } } });
