import { Maybe, Operation, Step } from '@opentscad/types';
import type { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js';

export function executeSteps(openCascade: OpenCascadeInstance, steps: Array<Step>): TopoDS_Shape {
  let shape: Maybe<TopoDS_Shape> = undefined;

  console.log('Executing steps', { steps });

  for (const step of steps) {
    switch (step.type) {
      case Operation.Box:
        shape = box(openCascade, step.params.width, step.params.height, step.params.depth);
        break;
    }
  }

  if (!shape) {
    throw new Error('No shape generated from steps');
  }

  return shape;
}

function box(
  openCascade: OpenCascadeInstance,
  width: number,
  height: number,
  depth: number,
): TopoDS_Shape {
  // @ts-ignore
  return new openCascade.BRepPrimAPI_MakeBox_1(width, height, depth).Shape();
}
