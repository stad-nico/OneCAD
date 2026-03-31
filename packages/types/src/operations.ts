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

interface TranslateParams {
  x: number;
  y: number;
  z: number;
}

interface RotateParams {
  x: number;
  y: number;
  z: number;
}

interface ScaleParams {
  x: number;
  y: number;
  z: number;
}

interface BoxParams {
  width: number;
  height: number;
  depth: number;
}

interface CubeParams {
  size: number;
}

interface SphereParams {
  radius: number;
}

interface CylinderParams {
  radius: number;
  height: number;
}

interface UnionParams {
  shapes: Step[];
}

interface DifferenceParams {
  shapes: Step[];
}

interface IntersectionParams {
  shapes: Step[];
}

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

export type Step = {
  [K in OperationKey]: {
    type: K;
    params: OperationParamsMap[K];
  };
}[OperationKey];
