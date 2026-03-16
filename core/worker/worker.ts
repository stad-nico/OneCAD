import { Logger } from '../shared';
import { initOpenCascade } from './init-opencascade';
import { processOperationRequest } from './process-operation-request';
import { WorkerRequest, WorkerRequestType } from './worker-event';

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  Logger.info('[Worker] Received message', { event });

  if (event.data.type === WorkerRequestType.Initialize) {
    return await initOpenCascade();
  } else {
    return await processOperationRequest(event.data);
  }
};
