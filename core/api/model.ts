import { Shape } from '../shape';

export interface Model {
	/**
	 * The unique identifier for the model.
	 */
	id: string;

	/**
	 * The name of the model.
	 */
	name: string;

	/**
	 * An optional description of the model.
	 */
	description?: string;

	/**
	 * The shape of the model.
	 */
	shape: Shape;
}
