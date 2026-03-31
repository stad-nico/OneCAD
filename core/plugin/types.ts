export * from '../network';

import { Model } from '../api/model';
import { HmrMessage, PluginEventType } from '../network';

type ImportMetaHot = {
	on: (event: string, callback: (payload: unknown) => void) => void;
};

function getHot(): ImportMetaHot | undefined {
	const meta = import.meta as unknown;
	if (typeof meta === 'object' && meta !== null && 'hot' in meta) {
		return (meta as { hot?: ImportMetaHot }).hot;
	}
	return undefined;
}

/**
 * Generic helper to subscribe to Vite/HMR custom events. The payload is typed as unknown
 * and cast by consumers. This avoids complex mapped-type mismatches while keeping no 'any'.
 */
export function onPluginEvent(type: PluginEventType, callback: (data: unknown) => void): void {
	const hot = getHot();
	if (hot) {
		hot.on(type, (payload: unknown) => {
			const msg = payload as HmrMessage<PluginEventType>;
			callback(msg.data);
		});
	}
}

/**
 * Convenience wrapper for the MODEL_OPERATIONS event used across the frontend.
 */
export function onModelChange(callback: (model: Model) => Promise<void> | void): void {
	onPluginEvent(PluginEventType.ModelOperations, (data) => {
		const d = data as { model: Model };
		void callback(d.model);
	});
}
