import { Logger } from '@opentscad/types';
import { BehaviorSubject } from 'rxjs';
import {
  WorkerMessageType,
  WorkerRequestPayload,
  WorkerResponseMessage,
  WorkerResponsePayload,
} from './types';
import { getOrInstantiateWorker } from './worker-instantiation';

type PendingRequest<Type extends WorkerMessageType> = {
  /**
   * Resolves the promise for the corresponding request.
   *
   * @param value the response payload from the worker.
   */
  resolve: (value: WorkerResponsePayload<Type>) => void;

  /**
   * Rejects the promise for the corresponding request.
   *
   * @param reason the reason for rejecting the promise, typically an error object or message.
   */
  reject: (reason?: unknown) => void;
};

/**
 * Currently open requests to the worker, meaning messages that have been sent to the worker
 * but have not yet received a response. This is used to correlate responses from the worker
 * back to the original requests and resolve or reject the corresponding promises.
 * Note that we maintain a separate map of pending requests for each message type to
 * ensure type safety when resolving promises with the correct response payload types.
 */
const pendingRequests: {
  [K in WorkerMessageType]?: Map<
    /**
     * The id of the request message
     */
    string,
    /**
     * The pending request promise
     */
    PendingRequest<K>
  >;
} = {};

/**
 * The web worker instance used for offloading computationally intensive tasks from the main thread.
 */
const worker = await getOrInstantiateWorker();

callWorker(WorkerMessageType.Initialize);

/**
 *
 */
worker.addEventListener(
  'message',
  (event: MessageEvent<WorkerResponseMessage<WorkerMessageType>>) => {
    if (event.data.type === WorkerMessageType.Initialize) {
      workerReady$.next(true);
    }
  },
);

worker.onmessage = <Type extends WorkerMessageType>(
  event: MessageEvent<WorkerResponseMessage<Type>>,
) => {
  const { id, type, payload, status } = event.data;

  Logger.debug(`[API] Received message from worker: ${type} with id ${id} and status ${status}`, {
    eventData: event.data,
  });

  const typeMap = pendingRequests[type];
  const pendingRequest = typeMap?.get(id);

  if (!pendingRequest) {
    Logger.warn(`[API] No pending request found for worker response with type ${type} (id: ${id})`);
    return;
  }

  typeMap!.delete(id);

  if (status === 'success') {
    pendingRequest.resolve(payload);
  } else {
    pendingRequest.reject(
      new Error(`Worker responded with error for message type ${type} (id: ${id})`),
    );
  }
};

/**
 * Sends a message to the web worker and returns a promise that resolves with the response.
 *
 * @param type the type of the message to send.
 * @param payload the payload for the message.
 * @returns a promise that resolves with the response from the worker or rejects if an error occurs.
 */
export function callWorker<Type extends WorkerMessageType>(
  type: Type,
  ...args: WorkerRequestPayload<Type> extends void ? [] : [payload: WorkerRequestPayload<Type>]
): Promise<WorkerResponsePayload<Type>> {
  const message = { type, id: crypto.randomUUID(), payload: args[0] };

  const promise = new Promise<WorkerResponsePayload<Type>>((resolve, reject) => {
    if (!pendingRequests[type]) {
      pendingRequests[type] = new Map();
    }

    pendingRequests[type]!.set(message.id, { resolve, reject });
  });

  Logger.debug(`[API] Sending message to worker: ${type} with id ${message.id}`, { message });

  worker.postMessage(message);

  return promise;
}

export const workerReady$ = new BehaviorSubject<boolean>(false);
