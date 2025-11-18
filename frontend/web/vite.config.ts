
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
      include: ['react', 'react-dom'],
      force: true,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      host: true, // Listen on all addresses
      open: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        // No especificar puerto fijo, Vite usará el mismo puerto que el servidor
        // Esto permite que funcione cuando el puerto cambia automáticamente
      },
    },
  });