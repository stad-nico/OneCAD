import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { opentscadModelPlugin } from './vite-plugin-opentscad';

export default defineConfig({
	plugins: [
		angular({
			tsconfig: './angular/tsconfig.app.json',
		}),
		opentscadModelPlugin(),
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
