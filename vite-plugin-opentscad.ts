import { Model } from '@opentscad/core';
import type { Plugin, ViteDevServer } from 'vite';
import { RawData, WebSocket, WebSocketServer } from 'ws';

const WEBSOCKET_PORT = 5174;

/**
 * OpenTSCAD Model Plugin with basic WebSocket support.
 */
export function opentscadModelPlugin(): Plugin {
	return {
		name: 'opentscad-model-ws',
		configureServer: (devServer) => configureServer(devServer),
	};
}

/**
 * Basic server configuration with WebSocket support.
 */
function configureServer(devServer: ViteDevServer) {
	const nodeServer = new WebSocketServer({ port: WEBSOCKET_PORT });

	console.log(`[Plugin] OpenTSCAD WS server listening on ws://localhost:${WEBSOCKET_PORT}`);

	nodeServer.on('connection', (socket) => handleClientConnection(socket, devServer));
}

/**
 * Handles individual WebSocket client connections.
 */
function handleClientConnection(socket: WebSocket, devServer: ViteDevServer) {
	console.log('[Plugin] Client connected');

	socket.on('error', (error: Error) => console.error('[Plugin] Client socket error:', error.message));

	socket.on('close', () => console.log('[Plugin] Client disconnected'));

	socket.on('message', async (data: RawData) => {
		try {
			const text = typeof data === 'string' ? data : data.toString('utf8');
			const message = JSON.parse(text);

			console.log('[Plugin] Received message:', message.type || 'unknown');

			if (message.type === 'MODEL_UPDATE' || message.file) {
				await handleModelUpdate(message, devServer);
			}

			if (message.id) {
				const response = {
					id: message.id,
					type: message.type,
					status: 'success',
					payload: { message: 'Model update processed' },
				};
				socket.send(JSON.stringify(response));
			}
		} catch (error: any) {
			console.error('[Plugin] Failed to process message:', error.message);

			try {
				const parsedMessage = JSON.parse(typeof data === 'string' ? data : data.toString('utf8'));
				if (parsedMessage.id) {
					const errorResponse = {
						id: parsedMessage.id,
						type: parsedMessage.type,
						status: 'error',
						error: error.message,
					};
					socket.send(JSON.stringify(errorResponse));
				}
			} catch {
				// If we can't parse or respond, just continue
			}
		}
	});
}

/**
 * Handles model update messages and sends HMR updates to frontend.
 */
async function handleModelUpdate(message: any, devServer: ViteDevServer) {
	try {
		console.log('[Plugin] Processing model update for file:', message.file);

		// Create a basic model structure for the frontend
		const model: Model = {
			id: message.file || 'default',
			name: message.file || 'Default Model',
			shape: {
				operations: [], // Will be populated by actual model compilation
			} as any,
		};

		// Send HMR update to frontend
		const hmrMessage = JSON.stringify({
			type: 'custom',
			event: 'opentscad:model-update',
			data: { model },
		});

		if (devServer?.ws?.send) {
			devServer.ws.send(hmrMessage);
			console.log('[Plugin] Sent model update to frontend');
		}
	} catch (error: any) {
		console.error('[Plugin] Failed to process model update:', error.message);
	}
}
