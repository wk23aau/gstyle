
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Recommended for alias, though not strictly used in this basic config

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // If you were using aliases like '@/components', you'd define them here.
      // Example: '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // The port your Vite frontend will run on
    strictPort: true, // Optional: Fails if this port is already in use
    proxy: {
      // Proxy API requests (e.g., /api/auth/login) to your backend server
      '/api': {
        target: 'http://localhost:3001', // Your backend server URL (Node.js/Express)
        changeOrigin: true, // Recommended for virtual hosted sites, and good practice
        secure: false,      // Set to true if your backend is on HTTPS with a valid certificate
        // rewrite: (path) => path.replace(/^\/api/, ''), // Optional: if your backend doesn't expect the /api prefix
      },
    },
    headers: {
      // Required for Google Sign-In popups to work correctly with Vite's dev server
      // when it's on a different origin than the Google OAuth consent screen.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  // Ensure environment variables prefixed with VITE_ are exposed to the client
  // by referencing them in your code as import.meta.env.VITE_YOUR_VAR
  // Vite automatically loads .env files.
  // define: {
  //   // Example if you needed to expose a non-prefixed var, but generally use VITE_ prefix
  //   // 'process.env.SOME_VAR': JSON.stringify(process.env.SOME_VAR)
  // }
});