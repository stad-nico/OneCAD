import { Logger, Maybe } from '@opentscad/types';
import type { OpenCascadeInstance } from 'opencascade.js';
// @ts-ignore
import initCascade from 'opencascade.js/dist/opencascade.wasm?init';
import { executeSteps } from './execute-steps';
import { triangulate } from './triangulate';
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
 * Otherwise, we switch the request type, execute the corresponding action and post the response to the main thread.
 * Right now, there is only the request to create a triangulation from the shape operations.
 *
 * @param request the request from the main thread
 */
export async function handleRequest(request: WorkerRequestMessage): Promise<void> {
  if (!openCascadeInstance) {
    Logger.warn('[Worker] OpenCascade instance not initialized yet, queuing request', { request });

    QUEUED_REQUESTS.push(request);
    return;
  }

  switch (request.type) {
    case WorkerMessageType.TriangulateMeshFromSteps: {
      const shape = executeSteps(openCascadeInstance, request.payload!.steps);

      const triangulation = triangulate(openCascadeInstance, shape);

      self.postMessage({
        id: request.id,
        type: WorkerMessageType.TriangulateMeshFromSteps,
        status: 'success',
        payload: { triangulation },
      } satisfies WorkerResponseMessage<WorkerMessageType.TriangulateMeshFromSteps>);
    }
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
    const instance = await initCascade();

    Logger.info('[Worker] OpenCascade initialized successfully', { instance });

    openCascadeInstance = instance;
  } catch (error) {
    Logger.error('[Worker] Failed to initialize OpenCascade', error);
  }

  try {
    Logger.info('[Worker] Processing queued requests', { QUEUED_REQUESTS });

    for (const request of QUEUED_REQUESTS) {
      await handleRequest(request);
    }

    Logger.info('[Worker] Finished processing queued requests');
  } catch (error) {
    Logger.error('[Worker] Error processing queued requests', error);
  }

  self.postMessage({
    id: request.id,
    type: WorkerMessageType.Initialize,
    status: 'success',
    payload: void 0,
  } satisfies WorkerResponseMessage<WorkerMessageType.Initialize>);
}
