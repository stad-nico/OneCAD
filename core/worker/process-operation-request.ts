import { Logger } from '../shared';
import { openCascadeInstance, QUEUED_REQUESTS } from './init-opencascade';
import {
  WorkerRequest,
  WorkerRequestType,
  WorkerResponse,
  WorkerResponseStatus,
} from './worker-event';
import { getWorkerRequestProcessor } from './worker-request-processor';

export async function processOperationRequest(request: WorkerRequest): Promise<void> {
  const { type, id, data } = request;

  const processor = getWorkerRequestProcessor(type);

  let responseMessage: WorkerResponse<WorkerRequestType>;

  try {
    if (!openCascadeInstance) {
      Logger.warn('[Worker] OpenCascade instance not ready, queueing request: ', { type, id });

      QUEUED_REQUESTS.push(request);

      return;
    }

    const response = await processor(openCascadeInstance, ...(data ?? []));

    responseMessage = { type, status: WorkerResponseStatus.Success, id, response };
  } catch (error) {
    Logger.error(`[Worker] Error processing request of type ${type}`, error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    responseMessage = { type, status: WorkerResponseStatus.Error, id, error: errorMessage };
  }

  self.postMessage(responseMessage);
}
