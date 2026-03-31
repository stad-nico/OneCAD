import { Step } from "./operations";

/**
 * This is the base interface for a model that we will display in the frontend
 */
export interface Model {
  /**
   * Unique identifier for the model
   */
  id: string;

  /**
   * Name of the model
   */
  name: string;

  /**
   * The sequence of steps that define how to construct the model.
   * Each step is an operation (like cube, translate, rotate) with its parameters.
   */
  steps: Array<Step>;
}
