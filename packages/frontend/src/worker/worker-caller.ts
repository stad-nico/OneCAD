import { Logger } from '@opentscad/types';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';
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
  [Type in WorkerMessageType]?: Map<
    /**
     * The id of the request message
     */
    string,
    /**
     * The pending request promise
     */
    PendingRequest<Type>
  >;
} = {};

/**
 * Retrieves a pending request for a specific message type and id.
 */
function getPendingRequest<Type extends WorkerMessageType>(
  type: Type,
  id: string,
): PendingRequest<Type> | undefined {
  return pendingRequests[type]?.get(id);
}

/**
 * The web worker instance used for offloading computationally intensive tasks from the main thread.
 */
const worker = await getOrInstantiateWorker();

callWorker(WorkerMessageType.Initialize);

/**
 *
 */
worker.addEventListener('message', (event: MessageEvent<WorkerResponseMessage>) => {
  if (event.data.type === WorkerMessageType.Initialize) {
    workerReady$.next(true);
  }
});

worker.onmessage = (event: MessageEvent<WorkerResponseMessage>) => {
  const message = event.data;

  Logger.debug(
    `[API] Received message from worker: ${message.type} with id ${message.id} and status ${message.status}`,
    {
      eventData: message,
    },
  );

  const pendingRequest = getPendingRequest(message.type, message.id);

  if (!pendingRequest) {
    Logger.warn(
      `[API] No pending request found for worker response with type ${message.type} (id: ${message.id})`,
    );
    return;
  }

  pendingRequests[message.type]!.delete(message.id);

  if (message.status === 'success') {
    pendingRequest.resolve(message.payload);
  } else {
    pendingRequest.reject(
      new Error(`Worker responded with error for message type ${message.type} (id: ${message.id})`),
    );
  }
};

/**
 * Sends a message to the web worker and returns a promise that resolves with the response.
 * If the worker is not yet initialized, this function will wait for it to be ready before sending the message.
 *
 * @param type the type of the message to send.
 * @param payload the payload for the message.
 * @returns a promise that resolves with the response from the worker or rejects if an error occurs.
 */
export async function callWorker<Type extends WorkerMessageType>(
  type: Type,
  ...args: WorkerRequestPayload<Type> extends void ? [] : [payload: WorkerRequestPayload<Type>]
): Promise<WorkerResponsePayload<Type>> {
  // Wait for worker to be ready if this is not an Initialize message
  if (type !== WorkerMessageType.Initialize) {
    await firstValueFrom(workerReady$.pipe(filter((isReady) => isReady)));
  }

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
