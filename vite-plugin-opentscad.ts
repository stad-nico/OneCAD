import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pathToFileURL } from 'url';
import type { Plugin, ViteDevServer } from 'vite';
import { WebSocketServer } from 'ws';
import { Logger } from './core/shared/logger';

interface ModelUpdateMessage {
	type: 'MODEL_UPDATE';
	file: string;
	code: string;
}

async function transpileTypeScript(code: string, sourcePath: string): Promise<string> {
	const result = await esbuild.build({
		// We use entryPoints instead of stdin for better resolution of relative imports from the file itself
		entryPoints: [sourcePath],
		bundle: true,
		write: false,
		format: 'esm',
		target: 'esnext',
		platform: 'node',
		// Mark everything as external except relative imports (./, ../)
		// This prevents bundling node_modules or absolute imports
		// Actually, for a self-contained model file, we SHOULD bundle local code if it's not a library.
		// But in this specific case, the user's issue is unintended bundling of `worker` code.
		// Let's exclude `openTSCAD` core libs if they are imported via package name, but here they are relative.
		external: ['three'],
		loader: { '.ts': 'ts' },
	});
	return result.outputFiles[0].text;
}

async function executeModelModule(jsCode: string, sourceFile: string): Promise<any> {
	// Write transpiled JS next to the original TS model so relative imports resolve.
	const dir = path.dirname(sourceFile);

	const ext = path.extname(sourceFile);
	const base = path.basename(sourceFile, ext);
	const coreName = base.endsWith('.model') ? base.slice(0, -'.model'.length) : base;

	// Use .mjs to enforce ESM mode for the generated file
	const outFile = path.join(dir, `${coreName}.model.mjs`);

	await fs.writeFile(outFile, jsCode, 'utf8');

	// Append timestamp to query to bypass Node's module cache for hot-reloading
	// Using a query parameter on file:// URLs is not standard in all Node versions/environments
	// but works in many cases. If not, we might need a unique filename each time.
	const url = pathToFileURL(outFile).href + `?t=${Date.now()}`;

	try {
		const mod = await import(url);
		if (typeof mod.default !== 'function') {
			throw new Error('Model module must export a default function that returns a Shape-like object');
		}
		return await mod.default();
	} catch (e: any) {
		// Log detailed error to help debug imports
		console.error('Error executing model module:', e);
		if (e.code === 'ERR_MODULE_NOT_FOUND') {
			console.error('Module not found details:', e.message);
		}
		throw e;
	}
}

async function handleModelUpdateMessage(server: ViteDevServer, payload: ModelUpdateMessage): Promise<void> {
	Logger.info('[server] MODEL_UPDATE received', { file: payload.file });
	try {
		// Pass the file path so esbuild can resolve relative imports
		const jsCode = await transpileTypeScript(payload.code, payload.file);
		Logger.debug('[server] Transpiled TypeScript for model', { file: payload.file });

		const shape = await executeModelModule(jsCode, payload.file);
		Logger.debug('[server] Executed model module, obtained Shape-like object', { file: payload.file });

		const operations = (shape as any).operations;
		if (!operations) {
			throw new Error('Model did not produce a Shape with an operations array');
		}

		Logger.debug('[server] Extracted operations from Shape, broadcasting to clients', {
			file: payload.file,
			operationCount: Array.isArray(operations) ? operations.length : undefined,
		});

		server.ws.send({
			type: 'custom',
			event: 'MODEL_OPERATIONS',
			data: {
				file: payload.file,
				operations,
			},
		});
		Logger.info('[server] MODEL_OPERATIONS broadcasted', { file: payload.file });
	} catch (err) {
		Logger.error('[server] Error handling MODEL_UPDATE', { file: payload.file, err });
	}
}

export function opentscadModelPlugin(): Plugin {
	return {
		name: 'opentscad-model-ws',
		configureServer(server) {
			// Standalone WebSocket server on its own port for the Node client
			const port = 5174; // choose any free port, just match it in the Node client
			const wss = new WebSocketServer({ port });

			Logger.info('[server] OpenTSCAD WS server listening', { url: `ws://localhost:${port}` });

			wss.on('connection', (socket, req) => {
				Logger.info('[server] Node WS client connected', { url: req.url });

				// Explicitly handle errors so they don't bubble and crash the process
				socket.on('error', (err: any) => {
					if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE')) {
						Logger.warn('[server] Ignoring Node WS socket error', { code: err.code, message: err.message });
						return;
					}
					Logger.error('[server] Node WS socket error', { err });
				});

				socket.on('close', (code, reason) => {
					Logger.info('[server] Node WS socket closed', { code, reason: reason?.toString() });
				});

				socket.on('message', async (raw, isBinary) => {
					try {
						if (isBinary) {
							Logger.warn('[server] Ignoring binary WS message from Node client');
							return;
						}

						const text = typeof raw === 'string' ? raw : raw.toString('utf8');
						const msg = JSON.parse(text) as ModelUpdateMessage | unknown;

						if (msg && (msg as any).type === 'MODEL_UPDATE') {
							await handleModelUpdateMessage(server, msg as ModelUpdateMessage);
						}
					} catch (e) {
						Logger.error('[server] Failed to process WS message from Node client', { err: e });
					}
				});
			});
		},
	};
}
