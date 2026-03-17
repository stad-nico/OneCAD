import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [topLevelAwait()],
  resolve: {
    alias: {
      '@opentscad/core': '/core/index.ts',
    },
  },
  assetsInclude: ['**/*.wasm'],
  build: {
    rollupOptions: {
      external: ['opencascade.js/dist/opencascade.full.wasm'],
    },
  },
});
