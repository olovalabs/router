import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { olovaRouter } from 'olova-router';

export default defineConfig({
  plugins: [react(), olovaRouter()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
