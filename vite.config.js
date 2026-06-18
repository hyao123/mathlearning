import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    cssMinify: 'lightningcss',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          if (id.includes('data.js')) {
            return 'data';
          }
        },
      },
    },
  },
  css: {
    lightningcss: {},
  },
});
