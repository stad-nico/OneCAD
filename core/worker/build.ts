import { TopoDS_Shape } from 'opencascade.js';
import { OpenCascadeInstance } from 'opencascade.js/dist/opencascade.full';
import { OperationCall } from '../types/Operations';
import { getOperationProcessor } from './operation-processor';
import { triangulate, TriangulationResult } from './triangulate';

export async function build(
  openCascade: OpenCascadeInstance,
  operations: Array<OperationCall>
): Promise<TriangulationResult> {
  let shape: TopoDS_Shape | undefined = undefined;

  for (const operation of operations) {
    shape = await executeOperation(openCascade, shape, operation);
  }

  if (!shape) {
    throw new Error('No shape was created from the operations');
  }

  return triangulate(openCascade, shape);
}

async function executeOperation(
  openCascade: OpenCascadeInstance,
  currentShape: TopoDS_Shape | undefined,
  operation: OperationCall
): Promise<TopoDS_Shape> {
  const processor = getOperationProcessor(operation.type);

  return await processor(openCascade, currentShape, operation.parameters as any);
}
