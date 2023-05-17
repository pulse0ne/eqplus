import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: './src-options',
  base: '',
  build: {
    // sourcemap: 'inline',
    outDir: '../extension/options',
    emptyOutDir: true
  },
  plugins: [react()],
});
