import { TopoDS_Shape } from 'opencascade.js';
import { Logger } from '../shared';
import { callWorker } from '../worker/main';
import { Shape } from './shape';

export async function buildOpenCascadeShape(shape: Shape): Promise<TopoDS_Shape> {
  for (const operation of shape.operations) {
    Logger.log(`Executing operation: ${operation.type}`);
    await callWorker(operation.type, operation.args);
  }
}
