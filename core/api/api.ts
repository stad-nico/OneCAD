import { Project } from '../../angular-interop/project';
import { Shape } from '../shape';
import { callWorker } from '../worker/main';
import { TriangulationResult } from '../worker/triangulate';
import { WorkerRequestType } from '../worker/worker-event';
import { Model } from './model';

export async function triangulateShape(shape: Shape): Promise<TriangulationResult> {
	return await callWorker(WorkerRequestType.Build, shape.operations);
}

export function modelMetadata(model: Omit<Model, 'id' | 'shape'>) {}

export function project(project: Project) {}
