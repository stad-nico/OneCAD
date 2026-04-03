import { Mesh } from 'three';
import { WorkerMessageType, WorkerResponsePayload } from '../worker/types';

export function visualize(
  triangulation: WorkerResponsePayload<WorkerMessageType.TriangulateMeshFromSteps>,
): Mesh {}
