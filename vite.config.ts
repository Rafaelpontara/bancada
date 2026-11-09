import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base './' deixa os caminhos relativos: o mesmo build funciona no
// GitHub Pages (em /nome-do-repo/), no Vercel e no Netlify.
export default defineConfig({
  base: './',
  plugins: [react()],
});
