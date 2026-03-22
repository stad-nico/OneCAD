import chokidar from 'chokidar';
import * as fs from 'fs';
import * as path from 'path';
import WebSocket from 'ws';
import { Logger } from './core/shared/logger';

const VITE_WS_URL = process.env.VITE_WS_URL || 'ws://localhost:5174';
const modelsDir = path.resolve(process.cwd(), 'models');

Logger.info(`[debug] Checking path: ${modelsDir}`);
Logger.info(`[debug] Exists: ${fs.existsSync(modelsDir)}`);
const watchPattern = path.join(modelsDir, '**', '*.model.ts').replace(/\\/g, '/');

Logger.info(`[client] Initializing watcher on: ${watchPattern}`);
Logger.info(`[debug] Files found via readdir: ${JSON.stringify(fs.readdirSync(modelsDir))}`);

const absoluteModelsDir = path.resolve(process.cwd(), 'models');

const watcher = chokidar.watch(absoluteModelsDir, {
	usePolling: true,
	interval: 100,
	ignoreInitial: false,
	depth: 99,
});

function onChange(filePath: string) {
	// Only process .model.ts files
	if (!filePath.endsWith('.model.ts')) return;

	const normalizedPath = filePath.replace(/\\/g, '/');
	Logger.debug(`[client] File changed: ${normalizedPath}`);

	fs.readFile(filePath, 'utf8', (err, code) => {
		if (err) {
			Logger.error('[client] Failed to read file', { filePath, err });
			return;
		}

		sendModelUpdate({
			type: 'MODEL_UPDATE',
			file: normalizedPath,
			code,
		});
	});
}

watcher.on('ready', () => {
	const watched = watcher.getWatched();
	Logger.info('[client] Watcher ready. Paths:', JSON.stringify(watched, null, 2));
});

const pendingMessages: string[] = [];

let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
const RECONNECT_DELAY_MS = 2000;

function scheduleReconnect() {
	if (reconnectTimeout) {
		return;
	}
	Logger.info('[client] Scheduling WebSocket reconnect', { delay: RECONNECT_DELAY_MS });
	reconnectTimeout = setTimeout(() => {
		reconnectTimeout = null;
		connectWebSocket();
	}, RECONNECT_DELAY_MS);
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
	});

	ws.on('error', (err) => {
		Logger.error('[client] WebSocket error', { err });
	});

	ws.on('close', (code, reason) => {
		Logger.warn('[client] WebSocket closed', { code, reason: reason?.toString() });
		ws = null;
		scheduleReconnect();
	});
}

connectWebSocket();

watcher.on('add', onChange);
watcher.on('change', onChange);

watcher.on('ready', () => {
	const watchedPaths = watcher.getWatched();
	Logger.info('[client] Watcher is ready.');
	Logger.info('[client] Currently watching:', JSON.stringify(watchedPaths, null, 2));
});

watcher.on('error', (err) => Logger.error('[client] Watcher error', { err }));

function sendModelUpdate(msg: { type: 'MODEL_UPDATE'; file: string; code: string }) {
	const payload = JSON.stringify(msg);

	if (ws && ws.readyState === WebSocket.OPEN) {
		try {
			ws.send(payload);
			Logger.info(`[client] Sent MODEL_UPDATE for ${msg.file}`);
		} catch (err) {
			Logger.error('[client] Error sending MODEL_UPDATE, queueing instead', { err, file: msg.file });
			pendingMessages.push(payload);
		}
		return;
	}

	Logger.warn('[client] WebSocket not open, queueing MODEL_UPDATE', { file: msg.file });
	pendingMessages.push(payload);
}
process.on('uncaughtException', (err) => {
	Logger.error('[client] Uncaught exception', { err });
});

process.on('unhandledRejection', (reason) => {
	Logger.error('[client] Unhandled rejection', { reason });
});
