import { Mesh } from 'three';

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
	 * The THREEJS mesh of the model, fully triangulated.
	 */
	mesh: Mesh;
}
