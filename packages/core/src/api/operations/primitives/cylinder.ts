import { Shape } from '../../../shape';
import { Operation } from '../../../shared';

/**
 * Constructs a cylinder shape with the specified radius and height
 *
 * @param radius - the radius of the cylinder
 * @param height - the height of the cylinder
 */
export function cylinder(radius: number, height: number): Shape {
	return new Shape([{ type: Operation.Cylinder, parameters: { radius, height } }]);
}