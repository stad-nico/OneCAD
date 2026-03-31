import initOpenCascadeWasm, { OpenCascadeInstance } from 'opencascade.js';
import openCascadeWasm from 'opencascade.js/dist/opencascade.full.wasm?url';
import { Maybe } from '../../shared/maybe';
import { Logger } from '../shared';
import { build } from './build';
import './operations';
import { WorkerRequest, WorkerRequestType, WorkerResponse, WorkerResponseStatus } from './worker-event';

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
const QUEUED_REQUESTS: Array<WorkerRequest> = [];

/**
 * Handles incoming messages from the main thread.
 *
 * @param event the message event from the main thread, containing the request to be processed
 */
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
	Logger.debug('[Worker] Received message', { event });

	await handleRequest(event.data);
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
export async function handleRequest(request: WorkerRequest): Promise<void> {
	if (!openCascadeInstance) {
		Logger.info('[Worker] OpenCascade instance not initialized yet, queuing request', {
			request,
		});

		QUEUED_REQUESTS.push(request);

		if (!initializationStarted) {
			await initOpenCascade();
		}

		return;
	}

	switch (request.type) {
		case WorkerRequestType.Build: {
			if (!request.data) {
				Logger.error('[Worker] Failed to execute build request: missing data');
				return;
			}

			const [operations] = request.data;

			const response = await build(openCascadeInstance, operations);

			self.postMessage({
				type: WorkerRequestType.Build,
				status: WorkerResponseStatus.Success,
				id: request.id,
				response,
			} satisfies WorkerResponse);
		}
	}
}

/**
 * Initializes the OpenCascade instance and processes any queued requests
 * that were received before the initialization was complete.
 */
async function initOpenCascade(): Promise<void> {
	if (openCascadeInstance) {
		Logger.debug('[Worker] OpenCascade instance already initialized, skipping initialization');
		return;
	}

	initializationStarted = true;

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
}
