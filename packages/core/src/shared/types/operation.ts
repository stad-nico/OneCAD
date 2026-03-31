export enum Operation {
  Translate = 'translate',
  Rotate = 'rotate',
  Scale = 'scale',
  Union = 'union',
  Difference = 'difference',
  Intersection = 'intersection',
  Box = 'box',
  Cube = 'cube',
  Sphere = 'sphere',
  Cylinder = 'cylinder',
  Triangulate = 'triangulate',
}

export type OperationParamsMap = {
  [Operation.Box]: {
    width: number;
    height: number;
    depth: number;
  };

  [Operation.Cube]: {
    size: number | [number, number, number];
  };

  [Operation.Sphere]: {
    radius: number;
  };

  [Operation.Cylinder]: {
    radius: number;
    height: number;
  };

  [Operation.Translate]: {
    x: number;
    y: number;
    z: number;
  };

  [Operation.Union]: {
    // Union parameters would be defined here if needed
  };
};
