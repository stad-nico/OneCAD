// ! TODO: refactor: split into multiple !
import { Logger, Maybe } from '@opentscad/types';
import type { OpenCascadeInstance } from 'opencascade.js/dist/opencascade.full';
import initOpenCascadeLib from 'opencascade.js/dist/opencascade.full.js';
import { evaluateAssembly } from './evaluate-shape-node';
import { WorkerMessageType, WorkerRequestMessage, WorkerResponseMessage } from './types';

/**
 * The OpenCascade instance that will be used to execute the operations.
 * This is initialized when the worker starts and is shared across all requests.
 */
let openCascadeInstance: Maybe<OpenCascadeInstance> = undefined;

/**
 * Whether the initialization of the OpenCascade instance has started.
 * This is used to prevent multiple initializations from happening at the same time.
 */
let initializationStarted = false;

/**
 * The requests that are received before the OpenCascade instance is initialized.
 * These will be processed once the initialization is complete.
 */
const QUEUED_REQUESTS: Array<WorkerRequestMessage> = [];

/**
 * Handles incoming messages from the main thread.
 *
 * @param event the message event from the main thread, containing the request to be processed
 */
self.onmessage = async (event: MessageEvent<WorkerRequestMessage>) => {
  Logger.debug('[Worker] Received message', { event });

  if (event.data.type !== WorkerMessageType.Initialize) {
    return await handleRequest(event.data);
  }

  if (!openCascadeInstance && !initializationStarted) {
    return await initOpenCascade(event.data);
  }
};

/**
 * Handles a request from the main thread.
 * If the OpenCascade instance is not initialized yet, the request is queued
 * and will be processed once the initialization is complete.
 *
 * Otherwise, we process the shape (either a Solid or Assembly) and post the response to the main thread.
 *
 * @param request the request from the main thread
 */
export async function handleRequest(request: WorkerRequestMessage): Promise<void> {
  if (!openCascadeInstance) {
    Logger.warn('[Worker] OpenCascade instance not initialized yet, queuing request', { request });

    QUEUED_REQUESTS.push(request);
    return;
  }

  if (request.type === WorkerMessageType.EvaluateAssembly) {
    const { assembly } = request.payload;

    const triangulation = await evaluateAssembly(openCascadeInstance, assembly);

    self.postMessage({
      id: request.id,
      type: WorkerMessageType.EvaluateAssembly,
      status: 'success',
      payload: { triangulation },
    } satisfies WorkerResponseMessage);
  }
}

/**
 * Initializes the OpenCascade instance and processes any queued requests
 * that were received before the initialization was complete.
 */
async function initOpenCascade(request: WorkerRequestMessage): Promise<void> {
  initializationStarted = true;

  Logger.info('[Worker] Initializing OpenCascade...');

  try {
    // @ts-ignore
    const instance: OpenCascadeInstance = await initOpenCascadeLib({
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) {
          return '/assets/opencascade.full.wasm';
        }
        return path;
      },
    });

    Logger.info('[Worker] OpenCascade initialized successfully', { instance });

    openCascadeInstance = instance;
  } catch (error) {
    Logger.error('[Worker] Failed to initialize OpenCascade', error);

    self.postMessage({
      id: request.id,
      type: WorkerMessageType.Initialize,
      status: 'error',
      payload: void 0,
    } satisfies WorkerResponseMessage);
    return;
  }

  self.postMessage({
    id: request.id,
    type: WorkerMessageType.Initialize,
    status: 'success',
    payload: void 0,
  } satisfies WorkerResponseMessage);

  if (QUEUED_REQUESTS.length > 0) {
    try {
      Logger.info('[Worker] Processing queued requests', { count: QUEUED_REQUESTS.length });

      const requestsToProcess = [...QUEUED_REQUESTS];
      QUEUED_REQUESTS.length = 0;

      for (const queuedRequest of requestsToProcess) {
        await handleRequest(queuedRequest);
      }

      Logger.info('[Worker] Finished processing queued requests');
    } catch (error) {
      Logger.error('[Worker] Error processing queued requests', error);
    }
  }
}
