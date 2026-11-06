import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const runtimeRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(runtimeRoot, '../..');
const port = Number(process.env.STOREFRONT_PORT || process.env.PORT || 3000);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, runtimeRoot, '');
  const apiOrigin = env.BACKEND_API_URL || process.env.BACKEND_API_URL || 'http://localhost:8080';
  const browserApiBaseUrl = env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL || '/api/v1';

  return {
    root: runtimeRoot,
    plugins: [react(), tailwindcss()],
    resolve: { dedupe: ['react', 'react-dom', 'react-router-dom'] },
    define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(browserApiBaseUrl) },
    server: {
      host: '0.0.0.0',
      port,
      strictPort: true,
      allowedHosts: ['.localhost', '.chandraprakash.codes'],
      fs: { allow: [repositoryRoot] },
      proxy: {
        '/api': { target: apiOrigin, changeOrigin: true },
      },
    },
    preview: { host: '0.0.0.0', port, strictPort: true },
    build: { outDir: path.join(runtimeRoot, 'dist'), emptyOutDir: true },
  };
});
