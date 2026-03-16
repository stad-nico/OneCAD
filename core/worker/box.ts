import { OpenCascadeInstance } from 'opencascade.js/dist/opencascade.full';
import { WorkerRequestData, WorkerRequestType, WorkerResponseData } from './worker-event';
import { WorkerRequestProcessor } from './worker-request-processor';

class Box {
  @WorkerRequestProcessor(WorkerRequestType.Box)
  public box(
    openCascade: OpenCascadeInstance,
    ...args: WorkerRequestData[WorkerRequestType.Box]
  ): WorkerResponseData[WorkerRequestType.Box] {
    const [width, height, depth] = args;
    return new openCascade.BRepPrimAPI_MakeBox_2(width, height, depth).Shape();
  }
}
