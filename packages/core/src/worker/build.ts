import { TopoDS_Shape } from 'opencascade.js';
import { OpenCascadeInstance } from 'opencascade.js/dist/opencascade.full';
import { Maybe } from '../../shared/maybe';
import { OperationCall } from '../shared/types/operations';
import { getOperationProcessor } from './operation-processor';
import { triangulate, TriangulationResult } from './triangulate';

/**
 * Handler for the Build request.
 * This function accepts an array of operations, executes them sequentially to
 * build a shape, and then triangulates the resulting shape.
 *
 * @param openCascade the open cascade instance
 * @param operations an array of operation calls to be executed
 * @returns the result of the triangulation
 */
export async function build(
	openCascade: OpenCascadeInstance,
	operations: Array<OperationCall>
): Promise<TriangulationResult> {
	let shape: Maybe<TopoDS_Shape> = undefined;

	for (const operation of operations) {
		shape = await executeOperation(openCascade, shape, operation);
	}

	if (!shape) {
		throw new Error('No shape was created from the operations');
	}

	return triangulate(openCascade, shape);
}

/**
 * Retrieves the correct processor function for
 * the current operation and executes it with the provided shape and parameters.
 *
 * @param openCascade the open cascade instance
 * @param currentShape the current shape being processed
 * @param operation the operation to be executed
 * @returns the resulting shape after the operation is applied
 */
async function executeOperation(
	openCascade: OpenCascadeInstance,
	currentShape: TopoDS_Shape | undefined,
	operation: OperationCall
): Promise<TopoDS_Shape> {
	const processor = getOperationProcessor(operation.type);

	return await processor(openCascade, currentShape, operation.parameters as unknown);
}
