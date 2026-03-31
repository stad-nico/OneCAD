import * as path from 'path';
import { Model } from '../api/model';
import { Shape } from '../shape';

// Export new message handling
export * from './message-handler';

export enum PluginEventType {
	ModelUpdate = 'MODEL_UPDATE',
	ModelOperations = 'MODEL_OPERATIONS',
}

type PluginEventMapping = {
	[PluginEventType.ModelUpdate]: {
		input: { file: string; code: string };
	};

	[PluginEventType.ModelOperations]: {
		input: { model: Model };
	};
};

export type PluginEventData = {
	[Type in PluginEventType]: PluginEventMapping[Type]['input'];
};

export type PluginMessage<Type extends PluginEventType = PluginEventType> = {
	type: Type;
	data: PluginEventMapping[Type]['input'];
};

// Node client -> Plugin server message (legacy shape used by the Node watcher)
export type NodeModelUpdateMessage = {
	type: PluginEventType.ModelUpdate;
	file: string;
	code: string;
};

export type ModelUpdateMessage = NodeModelUpdateMessage;

// Vite HMR wrapper message shape
export type HmrMessage<Type extends PluginEventType = PluginEventType> = {
	type: 'custom';
	event: Type;
	data: PluginEventMapping[Type]['input'];
};

export type ModelOperationsMessage = HmrMessage<PluginEventType.ModelOperations>;

/**
 * Create an HMR wrapper message for the given event and payload.
 */
export function createHmrMessage<Type extends PluginEventType>(
	event: Type,
	data: PluginEventMapping[Type]['input']
): HmrMessage<Type> {
	return { type: 'custom', event, data } as HmrMessage<Type>;
}

/** Convenience helper to build a Model object from a file and Shape */
export function buildModelFromShape(file: string, shape: Shape): Model {
	return { id: file, name: path.basename(file), shape };
}

// Generic request/response primitives for WebSocket-based RPC-style messages.
// These are not yet used by the runtime but provide a typed model for future
// request/response operations between node clients and the plugin.
export type WsRequest<Type extends string = string, Payload = unknown> = {
	id: string;
	type: Type;
	payload?: Payload;
};

export type WsResponse<Type extends string = string, Response = unknown> = {
	id: string;
	type: Type;
	status: 'success' | 'error';
	response?: Response;
	error?: string;
};

export function createWsRequest<Type extends string = string, Payload = unknown>(
	id: string,
	type: Type,
	payload?: Payload
): WsRequest<Type, Payload> {
	return { id, type, payload };
}

export function createWsResponse<Type extends string = string, Response = unknown>(
	id: string,
	type: Type,
	status: 'success' | 'error',
	response?: Response,
	error?: string
): WsResponse<Type, Response> {
	return { id, type, status, response, error };
}

// ---- RPC-specific typed mapping (example: Build) ----
export enum WsRpcType {
	Build = 'Build',
}

export type WsRpcMapping = {
	[WsRpcType.Build]: {
		request: { file: string; code: string };
		response: { model: Model };
	};
};

export type WsRpcRequestData = {
	[Type in WsRpcType]: WsRpcMapping[Type]['request'];
};

export type WsRpcResponseData = {
	[Type in WsRpcType]: WsRpcMapping[Type]['response'];
};

export type WsRpcRequest<Type extends WsRpcType = WsRpcType> = WsRequest<Type, WsRpcRequestData[Type]>;
export type WsRpcResponse<Type extends WsRpcType = WsRpcType> = WsResponse<Type, WsRpcResponseData[Type]>;

export function isWsRpcRequest(msg: unknown): msg is WsRpcRequest {
	return (
		typeof msg === 'object' &&
		msg !== null &&
		'id' in (msg as Record<string, unknown>) &&
		'type' in (msg as Record<string, unknown>) &&
		typeof (msg as Record<string, unknown>)['type'] === 'string'
	);
}

export function isWsRpcResponse(msg: unknown): msg is WsRpcResponse {
	return (
		typeof msg === 'object' &&
		msg !== null &&
		'id' in (msg as Record<string, unknown>) &&
		'status' in (msg as Record<string, unknown>) &&
		typeof (msg as Record<string, unknown>)['status'] === 'string'
	);
}
