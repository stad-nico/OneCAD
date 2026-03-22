import { Model } from './model';

export interface Project {
	/**
	 * The unique identifier for the project.
	 */
	id: string;

	/**
	 * The name of the project.
	 */
	name: string;

	/**
	 * The models associated with the project.
	 */
	models?: Array<Model>;
}
