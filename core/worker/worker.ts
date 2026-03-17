import initOpenCascadeWasm, { OpenCascadeInstance } from 'opencascade.js';
import openCascadeWasm from 'opencascade.js/dist/opencascade.full.wasm?url';
import { Logger } from '../shared';
import { OperationCall } from '../types/Operations';
import { build } from './build';
import './operations';
import { WorkerRequest, WorkerRequestType } from './worker-event';

export let openCascadeInstance: OpenCascadeInstance | null = null;

export const QUEUED_REQUESTS: Array<WorkerRequest> = [];

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  Logger.info('[Worker] Received message', { event });

  return await handleRequest(event.data);
};

export async function handleRequest(request: WorkerRequest): Promise<void> {
  const { type } = request;

  if (type === WorkerRequestType.Initialize) {
    await initOpenCascade();

    self.postMessage({
      type: WorkerRequestType.Initialize,
      status: 'success',
      id: request.id,
    });
  }

  if (!openCascadeInstance) {
    Logger.warn('[Worker] OpenCascade instance not initialized yet, queuing request', {
      request,
    });

    QUEUED_REQUESTS.push(request);
    return;
  }

  switch (request.type) {
    case WorkerRequestType.Build: {
      const [args] = request.data!;

      const response = await build(openCascadeInstance, args as Array<OperationCall>);

      self.postMessage({
        type: WorkerRequestType.Build,
        status: 'success',
        id: request.id,
        response,
      });
    }
  }
}

async function initOpenCascade(): Promise<void> {
  if (openCascadeInstance) {
    Logger.debug('[Worker] OpenCascade instance already initialized, skipping initialization');
    return;
  }

  Logger.info('[Worker] Initializing OpenCascade...');

  if (openCascadeInstance) {
    Logger.debug('[Worker] OpenCascade instance already initialized, returning existing instance');
    return;
  }

  try {
    // @ts-ignore
    const instance = await initOpenCascadeWasm({ locateFile: () => openCascadeWasm });

    Logger.info('[Worker] OpenCascade initialized successfully', { instance });

    openCascadeInstance = instance;
  } catch (error) {
    Logger.error('[Worker] Failed to initialize OpenCascade', error);
    throw error;
  }

  try {
    Logger.info('[Worker] Processing queued requests', { count: QUEUED_REQUESTS.length });

    for (const request of QUEUED_REQUESTS) {
      await handleRequest(request);
    }

    Logger.info('[Worker] Finished processing queued requests');
  } catch (error) {
    Logger.error('[Worker] Error processing queued requests', error);
  }
}
