import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'road-contained-arabia-unsigned.trycloudflare.com',
      'mandate-sake-interracial-victoria.trycloudflare.com'
    ]
  },

  resolve: {
    alias: {
      '@': '/src'
    }
  },

  // Vite optimisation: pre-bundle three.js and the React-Three Fiber/Drei packages
  // to avoid "Could not resolve 'three'" errors when the 3-D viewer is used.
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei'
    ]
  }
});