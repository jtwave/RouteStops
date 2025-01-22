import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'icons': ['lucide-react']
        }
      }
    }
  },
  define: {
    // This ensures environment variables are properly replaced during build
    'process.env.VITE_GEOAPIFY_API_KEY': JSON.stringify(process.env.VITE_GEOAPIFY_API_KEY),
    'process.env.TRIPADVISOR_API_KEY': JSON.stringify(process.env.TRIPADVISOR_API_KEY)
  }
});