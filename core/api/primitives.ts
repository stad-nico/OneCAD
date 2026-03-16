import { Operation } from '../types/Operation';
import { Shape } from './shape';

export function box(width: number, height: number, depth: number): Shape {
  return new Shape([{ type: Operation.Box, parameters: { width, height, depth } }]);
}
