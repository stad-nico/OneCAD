import { Shape } from '../../../shape';
import { Operation } from '../../../shared';

/**
 * Constructs a box shape with the specified width, height, and depth.
 *
 * @param width the width of the box
 * @param height the height of the box
 * @param depth the depth of the box
 * @returns the shape
 */
export function box(width: number, height: number, depth: number): Shape {
	return new Shape([{ type: Operation.Box, parameters: { width, height, depth } }]);
}
