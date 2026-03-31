import { Shape } from '../../../shape';
import { Operation } from '../../../shared';

/**
 * Constructs a cube shape with the specified size
 *
 * @param size - the size for all dimensions
 */
export function cube(size: number): Shape;

/**
 * Constructs a cube shape with the specified dimensions
 *
 * @param width - the width of the cube
 * @param height - the height of the cube  
 * @param depth - the depth of the cube
 */
export function cube(width: number, height: number, depth: number): Shape;

export function cube(sizeOrWidth: number, height?: number, depth?: number): Shape {
	if (height === undefined || depth === undefined) {
		// Single parameter - use for all dimensions
		const size = sizeOrWidth;
		return new Shape([{ type: Operation.Cube, parameters: { size: [size, size, size] } }]);
	} else {
		// Three parameters - width, height, depth
		return new Shape([{ type: Operation.Cube, parameters: { size: [sizeOrWidth, height, depth] } }]);
	}
}