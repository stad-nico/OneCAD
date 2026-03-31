import { Shape } from '../../../shape';

/**
 * Combines multiple shapes into a single union
 *
 * @param shapes - an array of shapes to combine
 */
export function union(shapes: Array<Shape>): Shape {
	if (shapes.length === 0) {
		throw new Error('Cannot create union of empty array');
	}

	if (shapes.length === 1) {
		return shapes[0];
	}

	return shapes.reduce((result, shape) => result.union(shape));
}
