import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // Use root base for embeddable script

  build: {
    outDir: 'dist', // Output to dist directory
    rollupOptions: {
      input: {
        embed: resolve(__dirname, 'src/embed.jsx'),
      },
      output: {
        entryFileNames: `[name].js`, // Output entry files with their names
        chunkFileNames: `chunks/[name]-[hash].js`, // Output chunk files (relative to output base)
        assetFileNames: `assets/[name]-[hash].[ext]`, // Output asset files (relative to output base)
      },
    },
    minify: false, // Disable minification for this build
  },
});