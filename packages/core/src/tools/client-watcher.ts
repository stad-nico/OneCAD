import chokidar from 'chokidar';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import WebSocket from 'ws';
import {
	createWsRequest,
	isWsRpcResponse,
	ModelUpdateMessage,
	PluginEventType,
	WsRpcRequest,
	WsRpcRequestData,
	WsRpcResponse,
	WsRpcResponseData,
	WsRpcType,
} from '../network';
import { Logger } from '../shared/logger';

const VITE_WS_URL = process.env.VITE_WS_URL || 'ws://localhost:5174';
const ABSOLUTE_MODELS_DIR = path.resolve(process.cwd(), 'models');
const RECONNECT_DELAY_MS = 2000;

let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
const pendingMessages: string[] = [];

// Pending RPC requests awaiting responses
const pendingRpc: Map<
	string,
	{
		resolve: (value: unknown) => void;
		reject: (reason?: unknown) => void;
	}
> = new Map();

function initWatcher() {
	Logger.info(`[debug] Watching directory: ${ABSOLUTE_MODELS_DIR}`);

	const watcher = chokidar.watch(ABSOLUTE_MODELS_DIR, {
		usePolling: true,
		interval: 100,
		ignoreInitial: false,
		depth: 99,
	});

	watcher.on('change', onChange);

	watcher.on('ready', () => {
		const watched = watcher.getWatched();
		Logger.info('[client] Watcher ready. Paths:', JSON.stringify(watched, null, 2));
	});

	return watcher;
}

function onChange(filePath: string) {
	if (!filePath.endsWith('.model.ts')) return;

	const normalizedPath = filePath.replace(/\\/g, '/');
	Logger.debug(`[client] File changed: ${normalizedPath}`);

	fs.readFile(filePath, 'utf8', (err, code) => {
		if (err) {
			Logger.error('[client] Failed to read file', { filePath, err });
			return;
		}

		// Prefer typed RPC request if socket is available
		if (ws && ws.readyState === WebSocket.OPEN) {
			sendRpcRequest(ws, WsRpcType.Build, { file: normalizedPath, code })
				.then((response) => {
					Logger.info('[client] Build RPC succeeded', { file: normalizedPath });
				})
				.catch((rpcErr) => {
					Logger.error('[client] Build RPC failed, falling back to queued MODEL_UPDATE', { err: rpcErr });
					// Fallback: queue legacy MODEL_UPDATE message to be sent when socket is available
					const payload: ModelUpdateMessage = {
						type: PluginEventType.ModelUpdate,
						file: normalizedPath,
						code,
					};
					pendingMessages.push(JSON.stringify(payload));
				});
		} else {
			// Legacy behavior: queue MODEL_UPDATE to send when connection is ready
			sendModelUpdate({ type: PluginEventType.ModelUpdate, file: normalizedPath, code });
		}
	});
}

function sendModelUpdate(payload: ModelUpdateMessage) {
	const msg = JSON.stringify(payload);

	if (ws && ws.readyState === WebSocket.OPEN) {
		ws.send(msg);
		Logger.info('[client] Sent MODEL_UPDATE', { file: payload.file });
	} else {
		Logger.warn('[client] WebSocket not open, queuing message', { file: payload.file });
		pendingMessages.push(msg);
	}
}

function scheduleReconnect() {
	if (reconnectTimeout) return;

	Logger.info('[client] Scheduling WebSocket reconnect', { delay: RECONNECT_DELAY_MS });
	reconnectTimeout = setTimeout(() => {
		reconnectTimeout = null;
		connectWebSocket();
	}, RECONNECT_DELAY_MS);
}

function flushPendingMessages() {
	if (pendingMessages.length > 0) {
		Logger.info('[client] Flushing queued MODEL_UPDATE messages', { count: pendingMessages.length });
		while (pendingMessages.length > 0 && ws && ws.readyState === WebSocket.OPEN) {
			const msg = pendingMessages.shift();
			if (!msg) continue;
			try {
				ws.send(msg);
			} catch (err) {
				Logger.error('[client] Error sending queued MODEL_UPDATE', { err });
				break;
			}
		}
	}
}

function handleIncomingMessage(text: string) {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch (err) {
		Logger.warn('[client] Received non-JSON WS message');
		return;
	}

	if (isWsRpcResponse(parsed)) {
		const res = parsed as WsRpcResponse;
		const handler = pendingRpc.get(res.id);
		if (!handler) {
			Logger.warn('[client] No pending RPC for response id', { id: res.id });
			return;
		}

		pendingRpc.delete(res.id);

		if (res.status === 'success') {
			handler.resolve(res.response as unknown);
		} else {
			handler.reject(new Error(res.error ?? 'rpc error'));
		}
		return;
	}

	// Not an RPC response — ignore or handle other messages
}

/**
 * Send a typed RPC request and await the typed response.
 */
export function sendRpcRequest<Type extends WsRpcType>(
	wsSocket: WebSocket,
	type: Type,
	payload: WsRpcRequestData[Type],
	timeoutMs = 10000
): Promise<WsRpcResponseData[Type]> {
	const id = randomUUID();

	const req: WsRpcRequest = createWsRequest(id, type, payload) as WsRpcRequest;

	return new Promise<WsRpcResponseData[Type]>((resolve, reject) => {
		pendingRpc.set(id, { resolve: resolve as (v: unknown) => void, reject });

		try {
			wsSocket.send(JSON.stringify(req));
		} catch (err) {
			pendingRpc.delete(id);
			reject(err);
			return;
		}

		const to = setTimeout(() => {
			if (pendingRpc.has(id)) {
				pendingRpc.delete(id);
				reject(new Error('RPC request timed out'));
			}
		}, timeoutMs);

		// When the promise resolves/rejects, clear timeout
		const cleanupResolve = resolve as unknown as (v: unknown) => void;
		const wrappedResolve = (val: unknown) => {
			clearTimeout(to);
			cleanupResolve(val);
		};
		pendingRpc.set(id, {
			resolve: wrappedResolve,
			reject: (reason?: unknown) => {
				clearTimeout(to);
				reject(reason);
			},
		});
	});
}

function connectWebSocket() {
	if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
		Logger.debug('[client] WebSocket already open or connecting, skipping reconnect');
		return;
	}

	Logger.info(`[client] Opening WebSocket connection to ${VITE_WS_URL}`);

	try {
		ws = new WebSocket(VITE_WS_URL);
	} catch (err) {
		Logger.error('[client] Failed to create WebSocket instance', { err });
		scheduleReconnect();
		return;
	}

	ws.on('open', () => {
		Logger.info('[client] Connected to Vite WebSocket');
		flushPendingMessages();
	});

	ws.on('error', (err) => {
		Logger.error('[client] WebSocket error', { err });
	});

	ws.on('close', () => {
		Logger.info('[client] WebSocket closed');
		ws = null;
		scheduleReconnect();
	});

	ws.on('message', (data: WebSocket.RawData) => {
		const text = typeof data === 'string' ? data : data.toString('utf8');
		handleIncomingMessage(text);
	});
}

export function startClientWatcher() {
	initWatcher();
	connectWebSocket();

	process.on('uncaughtException', (err) => {
		Logger.error('[client] Uncaught exception', { err });
	});

	process.on('unhandledRejection', (reason) => {
		Logger.error('[client] Unhandled rejection', { reason });
	});
}

// Allow running directly when executed as a script
if (require.main === module) {
	startClientWatcher();
}
