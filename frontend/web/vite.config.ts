
  import { defineConfig, loadEnv } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');
    
    // Parse port from env or use default
    const port = env.VITE_DEV_SERVER_PORT ? parseInt(env.VITE_DEV_SERVER_PORT, 10) : 3000;
    const host = env.VITE_DEV_SERVER_HOST || 'localhost';

    return {
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
        port,
        host,
        open: true,
        strictPort: false,
        hmr: {
          clientPort: port,
        },
      },
    };
  });