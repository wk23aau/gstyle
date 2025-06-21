import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ''); // Use process.cwd() for current working directory
    return {
      define: {
        // Keep existing define if needed, though API_KEY for frontend direct calls is deprecated
        'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: { // Add server configuration
        proxy: {
          // Proxy API requests
          '/api': {
            target: 'http://localhost:3001', // Your backend server address
            changeOrigin: true, // Recommended for virtual hosted sites
            // rewrite: (path) => path.replace(/^\/api/, '') // Uncomment if your backend doesn't expect /api prefix
          }
        }
      }
    };
});
