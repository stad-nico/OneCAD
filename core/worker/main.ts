import { Logger } from '../shared';
import {
	WorkerRequest,
	WorkerRequestData,
	WorkerRequestType,
	WorkerResponse,
	WorkerResponseData,
	WorkerResponseStatus,
} from './worker-event';

const pending: Map<
	string,
	{
		resolve: (response: WorkerResponseData[keyof WorkerResponseData]) => void;
		reject: (reason?: unknown) => void;
	}
> = new Map();

let worker: Worker | undefined;

function getWorker(): Worker {
	if (!worker) {
		worker = new Worker(new URL('./worker.ts?worker', import.meta.url), {
			type: 'module',
		});

		worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			const { status, id, error, response } = event.data;

			const handler = pending.get(id);

			if (!handler) {
				Logger.warn(`[API] No pending promise for message id ${id}, ignoring response`);
				return;
			}

			pending.delete(id);

			if (status === WorkerResponseStatus.Success) {
				if (response) {
					handler.resolve(response);
				} else {
					handler.reject('Worker response missing data');
				}
			} else {
				handler.reject(error);
			}
		};
	}

	return worker;
}

export function callWorker<MessageType extends WorkerRequestType>(
	type: MessageType,
	...args: WorkerRequestData[MessageType]
): Promise<WorkerResponseData[MessageType]> {
	const message: WorkerRequest<MessageType> = { type, id: crypto.randomUUID(), data: args };

	const promise = new Promise<WorkerResponseData[MessageType]>((resolve, reject) =>
		pending.set(message.id, { resolve: resolve as (value: unknown) => void, reject })
	);

	Logger.debug(`[API] Sending message to worker: ${type} with id ${message.id}`, { message });

	getWorker().postMessage(message);

	return promise;
}
