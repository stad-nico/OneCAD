export enum Operation {
  Translate = 'translate',
  Rotate = 'rotate',
  Scale = 'scale',
  Union = 'union',
  Difference = 'difference',
  Intersection = 'intersection',
  Box = 'box',
  Triangulate = 'triangulate',
}

export type OperationParamsMap = {
  [Operation.Box]: {
    width: number;
    height: number;
    depth: number;
  };

  [Operation.Translate]: {
    x: number;
    y: number;
    z: number;
  };
};
