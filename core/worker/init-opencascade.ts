import initOpenCascadeWasm, { OpenCascadeInstance } from 'opencascade.js';
import openCascadeWasm from 'opencascade.js/dist/opencascade.full.wasm?url';
import { Logger } from '../shared';
import { processOperationRequest } from './process-operation-request';
import { WorkerRequest } from './worker-event';

export let openCascadeInstance: OpenCascadeInstance | null = null;

export const QUEUED_REQUESTS: Array<WorkerRequest> = [];

export async function initOpenCascade(): Promise<void> {
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
      await processOperationRequest(request);
    }

    Logger.info('[Worker] Finished processing queued requests');
  } catch (error) {
    Logger.error('[Worker] Error processing queued requests', error);
  }
}
