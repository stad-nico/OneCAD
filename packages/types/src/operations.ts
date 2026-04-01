/**
 * The operation of a step in the model.
 * This can be a transformation (translate, rotate, scale)
 * or a primitive shape (box, cube, sphere, cylinder)
 * or a boolean operation (union, difference, intersection).
 */
export enum Operation {
  Translate = "translate",
  Rotate = "rotate",
  Scale = "scale",
  Union = "union",
  Difference = "difference",
  Intersection = "intersection",
  Box = "box",
  Cube = "cube",
  Sphere = "sphere",
  Cylinder = "cylinder",
}

/**
 * Params for the {@link Operation.Translate} operation.
 */
interface TranslateParams {
  x: number;
  y: number;
  z: number;
}

/**
 * Params for the {@link Operation.Rotate} operation.
 */
interface RotateParams {
  x: number;
  y: number;
  z: number;
}

/**
 * Params for the {@link Operation.Scale} operation.
 */
interface RotateParams {
  x: number;
  y: number;
  z: number;
}

/**
 * Params for the {@link Operation.Scale} operation.
 */
interface ScaleParams {
  x: number;
  y: number;
  z: number;
}

/**
 * Params for the {@link Operation.Box} operation.
 */
interface BoxParams {
  width: number;
  height: number;
  depth: number;
}

/**
 * Params for the {@link Operation.Cube} operation.
 */
interface CubeParams {
  size: number;
}

/**
 * Params for the {@link Operation.Sphere} operation.
 */
interface SphereParams {
  radius: number;
}

/**
 * Params for the {@link Operation.Cylinder} operation.
 */
interface CylinderParams {
  radius: number;
  height: number;
}

/**
 * Params for the {@link Operation.Union} operation.
 */
interface UnionParams {
  shapes: Step[];
}

/**
 * Params for the {@link Operation.Difference} operation.
 */
interface DifferenceParams {
  shapes: Step[];
}

/**
 * Params for the {@link Operation.Intersection} operation.
 */
interface IntersectionParams {
  shapes: Step[];
}

/**
 * Map of params for each operation.
 */
interface OperationParamsMap {
  [Operation.Translate]: TranslateParams;
  [Operation.Rotate]: RotateParams;
  [Operation.Scale]: ScaleParams;
  [Operation.Box]: BoxParams;
  [Operation.Cube]: CubeParams;
  [Operation.Sphere]: SphereParams;
  [Operation.Cylinder]: CylinderParams;
  [Operation.Union]: UnionParams;
  [Operation.Difference]: DifferenceParams;
  [Operation.Intersection]: IntersectionParams;
}

type OperationKey = keyof OperationParamsMap;

/**
 * Type for a step in the model.
 */
export type Step = {
  [K in OperationKey]: {
    type: K;
    params: OperationParamsMap[K];
  };
}[OperationKey];

/**
 * Type guard to check if an object is a valid Step. Note that this does not check whether the
 * params are valid for the given operation type, it only checks that the structure is correct.
 *
 * @param object the object to check
 * @returns true if the object is a valid Step, false otherwise
 */
export function isStep(object: unknown): object is Step {
  if (!object || typeof object !== "object") {
    return false;
  }

  const hasValidType =
    "type" in object &&
    typeof object.type === "string" &&
    object.type in Operation;

  const hasValidParams =
    "params" in object && typeof object.params === "object";

  return hasValidType && hasValidParams;
}
