import { Shape } from '../shape';
import { callWorker } from '../worker/main';
import { TriangulationResult } from '../worker/triangulate';
import { WorkerRequestType } from '../worker/worker-event';

export async function triangulateShape(shape: Shape): Promise<TriangulationResult> {
	return await callWorker(WorkerRequestType.Build, shape.operations);
}
