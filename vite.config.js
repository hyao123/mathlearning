import { defineConfig } from 'vite';

function devCommonJsBridge() {
  return {
    name: 'dev-commonjs-bridge',
    apply: 'serve',
    transform(code, id) {
      if (id.includes('node_modules')) return null;
      const cleanId = id.split('?')[0];
      if (!cleanId.endsWith('.js')) return null;
      if (
        (code.includes('module.exports') || code.includes('exports.')) &&
        !/export\s+(default|const|let|var|function|class)\s/.test(code)
      ) {
        return {
          code: `
const module = { exports: {} };
const exports = module.exports;
const require = (key) => (globalThis.__commonJsRegistry?.get(key) ?? (typeof globalThis.require === 'function' ? globalThis.require(key) : undefined));
${code}
export default module.exports;
          `,
          map: null
        };
      }
      return null;
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [devCommonJsBridge()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
  },
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
          if (id.includes('/curriculum/')) {
            return 'curriculum';
          }
          if (id.includes('QuestionPacks') || id.includes('nativeQuestionPacks') || id.includes('methodQuestionPackFactory')) {
            return 'question-packs';
          }
          if (id.includes('questionVisualizer') || id.includes('/visualizers/')) {
            return 'visualizer';
          }
        },
      },
    },
  },
  css: {
    lightningcss: {},
  },
});
