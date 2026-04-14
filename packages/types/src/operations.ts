import { Component } from "./assembly";

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
  Box = "box",
  Cube = "cube",
  Sphere = "sphere",
  Cylinder = "cylinder",
}

/**
 * Params for the {@link Operation.Translate} operation.
 */
interface TranslateParams {
  /**
   * The distance to translate along the x-axis.
   */
  x: number;

  /**
   * The distance to translate along the y-axis.
   */
  y: number;

  /**
   * The distance to translate along the z-axis.
   */
  z: number;

  /**
   * The component to translate.
   */
  component: Component;
}

/**
 * Params for the {@link Operation.Rotate} operation.
 */
interface RotateParams {
  /**
   * The angle to rotate around the x-axis.
   */
  x: number;

  /**
   * The angle to rotate around the y-axis.
   */
  y: number;

  /**
   * The angle to rotate around the z-axis.
   */
  z: number;

  /**
   * The component to rotate.
   */
  component: Component;
}

/**
 * Params for the {@link Operation.Scale} operation.
 */
interface ScaleParams {
  /**
   * The scale factor along the x-axis.
   */
  x: number;

  /**
   * The scale factor along the y-axis.
   */
  y: number;

  /**
   * The scale factor along the z-axis.
   */
  z: number;

  /**
   * The component to scale.
   */
  component: Component;
}

/**
 * Params for the {@link Operation.Box} operation.
 */
interface BoxParams {
  /**
   * The width of the box.
   */
  width: number;

  /**
   * The height of the box.
   */
  height: number;

  /**
   * The depth of the box.
   */
  depth: number;
}

/**
 * Params for the {@link Operation.Cube} operation.
 */
interface CubeParams {
  /**
   * The size of the cube.
   */
  size: number;
}

/**
 * Params for the {@link Operation.Sphere} operation.
 */
interface SphereParams {
  /**
   * The radius of the sphere.
   */
  radius: number;
}

/**
 * Params for the {@link Operation.Cylinder} operation.
 */
interface CylinderParams {
  /**
   * The radius of the cylinder.
   */
  radius: number;

  /**
   * The height of the cylinder.
   */
  height: number;
}

/**
 * Params for the {@link Operation.Union} operation.
 */
interface UnionParams {
  /**
   * The components to union together.
   */
  components: Array<Component>;
}

/**
 * Params for the {@link Operation.Difference} operation.
 */
interface DifferenceParams {
  /**
   * The component to subtract from.
   */
  target: Component;

  /**
   * The components to subtract.
   */
  tools: Array<Component>;
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
}

type OperationKey = keyof OperationParamsMap;

/**
 * Type helper to get the params type for a given operation.
 */
export type OperationParameters<K extends OperationKey> = OperationParamsMap[K];

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
    Object.values(Operation).includes(object.type as Operation);

  const hasValidParams =
    "params" in object && typeof object.params === "object";

  return hasValidType && hasValidParams;
}
