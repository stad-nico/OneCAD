import { Shape } from '../../../shape';
import { Operation } from '../../../shared';

/**
 * Constructs a sphere shape with the specified radius
 *
 * @param radius - the radius of the sphere
 */
export function sphere(radius: number): Shape {
	return new Shape([{ type: Operation.Sphere, parameters: { radius } }]);
}