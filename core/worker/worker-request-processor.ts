import { OpenCascadeInstance } from 'opencascade.js/dist/opencascade.full.js';
import { WorkerRequestData, WorkerRequestType, WorkerResponseData } from './worker-event';

type WorkerRequestProcessor<Type extends WorkerRequestType> = (
  openCascade: OpenCascadeInstance,
  ...args: WorkerRequestData[Type]
) => Promise<WorkerResponseData[Type]>;

const WorkerRequestProcessors: {
  [Type in WorkerRequestType]?: WorkerRequestProcessor<Type>;
} = {};

export function WorkerRequestProcessor(type: WorkerRequestType): MethodDecorator {
  return (target: object, propertyKey: string | symbol, descriptor: any): void => {
    if (!descriptor.value) {
      throw new Error(`Method ${String(propertyKey)} has no implementation.`);
    }

    WorkerRequestProcessors[type] = descriptor.value;
  };
}

export function getWorkerRequestProcessor<Type extends WorkerRequestType>(
  type: Type
): WorkerRequestProcessor<Type> {
  const processor = WorkerRequestProcessors[type];

  if (!processor) {
    throw new Error(`No worker request processor found for type ${type}!`);
  }

  return processor as WorkerRequestProcessor<Type>;
}
