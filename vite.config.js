import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  root: "frontend",  // Imposta "frontend" come directory root
  plugins: [react()],
 
  build: {
    outDir: "../dist",  // Cartella di output della build (fuori dalla directory "frontend")
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5174",  // Il tuo server backend Express
        changeOrigin: true,
        secure: false,  // Disattiva la sicurezza SSL per le richieste locali
      },
    },
  },
});
