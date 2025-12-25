import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  // Define the 'sra-frontend' folder as the source of your public assets
  publicDir: 'sra-frontend/public', 
  resolve: {
    alias: {
      // Create a shortcut for easier imports
      "@": "/sra-frontend/src",
    },
  },
});