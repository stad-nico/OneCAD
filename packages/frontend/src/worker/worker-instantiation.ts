import { Maybe } from '@opentscad/types';
import { WorkerMessageType } from './types';
import { callWorker } from './worker-caller';

/**
 * The current web worker instance, undefined if the worker has not yet been instantiated.
 */
let workerInstance: Maybe<Worker> = undefined;

/**
 * A promise representing the instantiation process, or undefined if not currently instantiating.
 */
let workerInstantiatingPromise: Maybe<Promise<Worker>> = undefined;

/**
 * Gets the current web worker instance, instantiating it if it doesn't already exist.
 *
 * @returns the web worker instance.
 */
export async function getOrInstantiateWorker(): Promise<Worker> {
  if (workerInstantiatingPromise) {
    return workerInstantiatingPromise;
  }

  workerInstantiatingPromise = new Promise(async (resolve) => {
    const worker = new Worker(new URL('./worker.ts?worker', import.meta.url), { type: 'module' });

    workerInstance = worker;
    await callWorker(WorkerMessageType.Initialize);

    resolve(worker);
  });

  return workerInstantiatingPromise;
}
