import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    angular({
      tsconfig: './angular/tsconfig.app.json',
    }),
  ],
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
