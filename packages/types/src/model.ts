import { isStep, Step } from "./operations";

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

/**
 * Type guard to check if an object conforms to the Model interface.
 *
 * @param object the object to check
 * @returns true if the object conforms to the Model interface, false otherwise
 */
export function isModel(object: unknown): object is Model {
  if (!object || !(typeof object === "object")) {
    return false;
  }

  const hasValidId = "id" in object && typeof object.id === "string";

  const hasValidName = "name" in object && typeof object.name === "string";

  const hasValidSteps =
    "steps" in object &&
    Array.isArray(object.steps) &&
    object.steps.every((step) => isStep(step));

  return hasValidId && hasValidName && hasValidSteps;
}
