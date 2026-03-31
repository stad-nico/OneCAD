import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pathToFileURL } from 'url';
import type { Plugin, ViteDevServer } from 'vite';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { Model } from './core/api/model';
import { createHmrMessage, createWsResponse, isWsRpcRequest, WsRpcRequest, WsRpcType } from './core/network';
import { ModelUpdateMessage, PluginEventType } from './core/plugin/types';
import { Shape } from './core/shape';
import { Logger } from './core/shared/logger';
import { Maybe } from './shared/maybe';

/**
 * Architecture of this is as follows:
 *
 * Client <-- WebSocket --> Vite Plugin
 * Vite Plugin <-- Vite Web Server (HMR) --> Frontend (Angular)
 * Frontend <-- Web Worker --> OpenCascade.js
 */

const WEBSOCKET_PORT = 5174;

export function opentscadModelPlugin(): Plugin {
	return { name: 'opentscad-model-ws', configureServer };
}

function configureServer(devServer: ViteDevServer) {
	// Node clients connect to this WebSocketServer to push model updates
	const nodeServer = new WebSocketServer({ port: WEBSOCKET_PORT });

	Logger.info('[Server] OpenTSCAD WS server listening', { url: `ws://localhost:${WEBSOCKET_PORT}` });

	// When a new Node client connects, pass the Vite dev server so we can forward
	// processed model operations to the frontend via HMR.
	nodeServer.on('connection', (socket) => handleServerConnection(socket, devServer, nodeServer));
}

function handleServerConnection(socket: WebSocket, devServer: ViteDevServer, nodeServer: WebSocketServer) {
	Logger.info('[Server] Node WS client connected');

	socket.on('error', (error: Error) => Logger.error('[server] Node WS socket error', { error }));

	socket.on('close', () => Logger.info('[server] Node WS socket closed'));

	socket.on('message', async (data: RawData) => {
		try {
			Logger.info('[server] Received WS message', { data });

			const text = typeof data === 'string' ? data : data.toString('utf8');
			const parsed = JSON.parse(text) as unknown;

			// Handle RPC-style requests (e.g. Build)
			if (isWsRpcRequest(parsed)) {
				const req = parsed as WsRpcRequest;

				switch (req.type) {
					case WsRpcType.Build: {
						Logger.info('[server] WS RPC Build request received', { id: req.id });
						try {
							// payload expected: { file, code }
							const payload = req.payload as { file: string; code: string };
							const jsCode = await transpileTypeScript(payload.code, payload.file);
							const shape = await executeModelModuleOrThrow(jsCode, payload.file);

							if (!shape) {
								throw new Error('Model module did not return a Shape instance');
							}

							const model: Model = { id: payload.file, name: path.basename(payload.file), shape };

							const res = createWsResponse(req.id, req.type, 'success', { model });
							socket.send(JSON.stringify(res));
						} catch (err) {
							const res = createWsResponse(req.id, req.type, 'error', undefined, String(err));
							socket.send(JSON.stringify(res));
						}

						break;
					}
					default:
						Logger.warn('[server] Unknown RPC request type', { type: String(req.type) });
				}
				return;
			}

			const msg = parsed;

			if (isModelUpdateMessage(msg)) {
				const update = msg as ModelUpdateMessage;
				Logger.info('[server] MODEL_UPDATE received', { file: update.file });

				await processModelUpdateOrThrow(update, devServer);
			}
		} catch (e) {
			Logger.error('[server] Failed to process WS message', { err: e });
		}
	});
}

async function processModelUpdateOrThrow(payload: ModelUpdateMessage, devServer: ViteDevServer): Promise<void> {
	const jsCode = await transpileTypeScript(payload.code, payload.file);
	const shape = await executeModelModuleOrThrow(jsCode, payload.file);

	if (!shape) {
		throw new Error('Model module did not return a Shape instance');
	}

	const model: Model = { id: payload.file, name: path.basename(payload.file), shape };

	const message = createHmrMessage(PluginEventType.ModelOperations, { model });

	Logger.info('[server] Sending model operations to frontend', { file: payload.file });

	// Send HMR custom event via Vite dev server websocket
	if (devServer && devServer.ws && typeof devServer.ws.send === 'function') {
		devServer.ws.send(message);
	} else {
		Logger.warn('[server] Vite dev server websocket not available, cannot forward MODEL_OPERATIONS');
	}
}

async function transpileTypeScript(code: string, sourcePath: string): Promise<string> {
	const result = await esbuild.build({
		entryPoints: [sourcePath],
		bundle: true,
		write: false,
		format: 'esm',
		target: 'esnext',
		platform: 'node',
		external: ['three'],
		loader: { '.ts': 'ts' },
	});
	return result.outputFiles[0].text;
}

async function executeModelModuleOrThrow(jsCode: string, sourceFile: string): Promise<Maybe<Shape>> {
	const dir = path.dirname(sourceFile);
	const ext = path.extname(sourceFile);
	const base = path.basename(sourceFile, ext);
	const coreName = base.endsWith('.model') ? base.slice(0, -'.model'.length) : base;

	const outFile = path.join(dir, `${coreName}.model.mjs`);

	await fs.writeFile(outFile, jsCode, 'utf8');

	const url = pathToFileURL(outFile).href + `?t=${Date.now()}`;

	try {
		const mod = await import(url);
		if (typeof mod.default !== 'function') {
			throw new Error('Model module must export a default function that returns a Shape-like object');
		}

		const shape = await mod.default();

		console.log('Executed model module, got shape:', shape);

		// If module returned a genuine Shape instance, return it.
		if (shape instanceof Shape) {
			return shape;
		}

		// Accept shape-like plain objects (from bundled module where Shape class differs)
		if (shape && typeof shape === 'object' && Array.isArray((shape as any).operations)) {
			Logger.info('[server] Model returned shape-like object; coercing to Shape instance');
			return new Shape((shape as any).operations);
		}

		throw new Error('Model module default export must return a Shape instance or a shape-like object');

		return shape;
	} catch (e: unknown) {
		console.error('Error executing model module:', e);
		// Attempt to provide extra details for common module-not-found errors
		if (typeof e === 'object' && e !== null && 'code' in e) {
			const errObj = e as Record<string, unknown>;
			if (errObj.code === 'ERR_MODULE_NOT_FOUND') {
				console.error('Module not found details:', String(errObj.message ?? ''));
			}
		}
		throw e;
	}
}

function isModelUpdateMessage(msg: unknown): msg is ModelUpdateMessage {
	if (typeof msg !== 'object' || msg === null) return false;
	const r = msg as Record<string, unknown>;
	return r.type === 'MODEL_UPDATE' && typeof r.file === 'string' && typeof r.code === 'string';
}
