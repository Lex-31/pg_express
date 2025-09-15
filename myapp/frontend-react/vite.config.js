import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import the path module

export default defineConfig({
  plugins: [react()],
  base: '/admin/', //базовый путь приложения

  build: {
    // Build embed.js as a separate entry point
    rollupOptions: {
      input: {
        // Define entry points: 'main' for the main app, 'embed' for the embeddable form
        main: path.resolve(__dirname, 'index.html'), // Your main app entry (usually index.html)
        embed: path.resolve(__dirname, 'src/embed.jsx'), // Your embeddable script entry
      },
      output: {
        // Configure output names - keep consistent with your build process
        // Ensure that 'embed' output is named appropriately
        entryFileNames: `[name].js`, // Output entry files with their names
        chunkFileNames: `chunks/[name]-[hash].js`, // Output chunk files
        assetFileNames: `assets/[name]-[hash].[ext]`, // Output asset files
      },
    },
  },
});
