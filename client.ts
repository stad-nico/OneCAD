import chokidar from 'chokidar';
import * as fs from 'fs';
import * as path from 'path';
import WebSocket from 'ws';
import { ModelUpdateMessage, PluginEventType } from './core/network';
import { Logger } from './core/shared/logger';

const VITE_WS_URL = process.env.VITE_WS_URL || 'ws://localhost:5174';
const ABSOLUTE_MODELS_DIR = path.resolve(process.cwd(), 'models');
const RECONNECT_DELAY_MS = 2000;

let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
const pendingMessages: string[] = [];

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

		sendModelUpdate({
			type: PluginEventType.ModelUpdate,
			file: normalizedPath,
			code,
		});
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
		// Usually 'close' event follows, but in some node versions/cases it might not for connection refused
		// We rely on 'close' to trigger reconnect usually, but for initial connection fail handle here?
		// Actually ws emits error then close.
	});

	ws.on('close', () => {
		Logger.info('[client] WebSocket closed');
		ws = null;
		scheduleReconnect();
	});
}

// Start
initWatcher();
connectWebSocket();

process.on('uncaughtException', (err) => {
	Logger.error('[client] Uncaught exception', { err });
});

process.on('unhandledRejection', (reason) => {
	Logger.error('[client] Unhandled rejection', { reason });
});
