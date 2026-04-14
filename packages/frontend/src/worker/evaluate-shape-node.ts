import { AstAssemblyNode, AstComponentNode, Logger, Maybe, Operation } from '@opentscad/types';
import type { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js/dist/opencascade.full';
import { triangulate, TriangulationResult } from './triangulate';

export function evaluateAssembly(
  openCascade: OpenCascadeInstance,
  assembly: AstAssemblyNode,
): TriangulationResult {
  Logger.debug('[Worker] Evaluating assembly', { assembly });

  const { components } = assembly;

  const shape = components.reduce((currentShape: Maybe<TopoDS_Shape>, component) => {
    const componentShape = evaluateComponent(openCascade, component);

    if (!currentShape) {
      return componentShape;
    }

    return unionShapes(openCascade, currentShape, componentShape);
  }, undefined);

  if (!shape) {
    Logger.warn(
      '[Worker] Assembly evaluation resulted in no shape, returning empty triangulation',
      { assembly },
    );

    return {
      vertices: new Float32Array(),
      normals: new Float32Array(),
      indices: new Uint32Array(),
    };
  }

  return triangulate(openCascade, shape);
}

export function evaluateComponent(
  openCascade: OpenCascadeInstance,
  component: AstComponentNode,
): TopoDS_Shape {
  // Use discriminated union to ensure type safety - don't destructure operation and params separately
  switch (component.operation) {
    case Operation.Box:
      return createBox(
        openCascade,
        component.params.width,
        component.params.height,
        component.params.depth,
      );

    case Operation.Sphere:
      return createSphere(openCascade, component.params.radius);

    case Operation.Cylinder:
      return createCylinder(openCascade, component.params.radius, component.params.height);

    case Operation.Translate: {
      return translateShape(
        openCascade,
        evaluateComponent(openCascade, component.params.component),
        component.params.x,
        component.params.y,
        component.params.z,
      );
    }

    case Operation.Rotate: {
      return rotateShape(
        openCascade,
        evaluateComponent(openCascade, component.params.component),
        component.params.x,
        component.params.y,
        component.params.z,
      );
    }

    case Operation.Scale: {
      return scaleShape(
        openCascade,
        evaluateComponent(openCascade, component.params.component),
        component.params.x,
        component.params.y,
        component.params.z,
      );
    }

    case Operation.Union: {
      return unionShapes(
        openCascade,
        evaluateComponent(openCascade, component.params.components[0]),
        evaluateComponent(openCascade, component.params.components[1]),
      );
    }

    case Operation.Difference: {
      return differenceShapes(
        openCascade,
        evaluateComponent(openCascade, component.params.target),
        evaluateComponent(openCascade, component.params.tools[0]),
      );
    }

    case Operation.Cube:
      return createBox(
        openCascade,
        component.params.size,
        component.params.size,
        component.params.size,
      );
  }
}

/**
 * Creates a box shape in OCP.
 */
function createBox(
  openCascade: OpenCascadeInstance,
  width: number,
  height: number,
  depth: number,
): any {
  return new openCascade.BRepPrimAPI_MakeBox_2(width, height, depth).Shape();
}

/**
 * Creates a sphere shape in OCP.
 */
function createSphere(openCascade: OpenCascadeInstance, radius: number): any {
  return new openCascade.BRepPrimAPI_MakeSphere_1(radius).Shape();
}

/**
 * Creates a cylinder shape in OCP.
 */
function createCylinder(openCascade: OpenCascadeInstance, radius: number, height: number): any {
  return new openCascade.BRepPrimAPI_MakeCylinder_1(radius, height).Shape();
}

/**
 * Translates a shape by the given distance.
 */
function translateShape(
  openCascade: OpenCascadeInstance,
  shape: any,
  x: number,
  y: number,
  z: number,
): any {
  const trsf = new openCascade.gp_Trsf_1();

  const vec = new openCascade.gp_Vec_4(x, y, z);
  trsf.SetTranslation_1(vec);

  return new openCascade.BRepBuilderAPI_Transform_2(shape, trsf, false).Shape();
}

/**
 * Rotates a shape by the given angles (in degrees) around each axis.
 */
function rotateShape(
  openCascade: OpenCascadeInstance,
  shape: any,
  x: number,
  y: number,
  z: number,
): any {
  let rotated = shape;

  // Rotate around X axis
  if (x !== 0) {
    const trsf = new openCascade.gp_Trsf_1();
    const axis = new openCascade.gp_Ax1_2(
      new openCascade.gp_Pnt_3(0, 0, 0),
      new openCascade.gp_Dir_4(1, 0, 0),
    );

    trsf.SetRotation_1(axis, (x * Math.PI) / 180);
    rotated = new openCascade.BRepBuilderAPI_Transform_2(rotated, trsf, false).Shape();
  }

  // Rotate around Y axis
  if (y !== 0) {
    const trsf = new openCascade.gp_Trsf_1();
    const axis = new openCascade.gp_Ax1_2(
      new openCascade.gp_Pnt_3(0, 0, 0),
      new openCascade.gp_Dir_4(0, 1, 0),
    );
    trsf.SetRotation_1(axis, (y * Math.PI) / 180);
    rotated = new openCascade.BRepBuilderAPI_Transform_2(rotated, trsf, false).Shape();
  }

  // Rotate around Z axis
  if (z !== 0) {
    const trsf = new openCascade.gp_Trsf_1();
    const axis = new openCascade.gp_Ax1_2(
      new openCascade.gp_Pnt_3(0, 0, 0),
      new openCascade.gp_Dir_4(0, 0, 1),
    );
    trsf.SetRotation_1(axis, (z * Math.PI) / 180);
    rotated = new openCascade.BRepBuilderAPI_Transform_2(rotated, trsf, false).Shape();
  }

  return rotated;
}

/**
 * Scales a shape by the given factors.
 */
function scaleShape(
  openCascade: OpenCascadeInstance,
  shape: any,
  x: number,
  y: number,
  z: number,
): any {
  // For now, use uniform scale (average of x, y, z)
  const uniformScale = (x + y + z) / 3;

  const trsf = new openCascade.gp_Trsf_1();
  trsf.SetScale(new openCascade.gp_Pnt_3(0, 0, 0), uniformScale);

  return new openCascade.BRepBuilderAPI_Transform_2(shape, trsf, false).Shape();
}

/**
 * Performs a union of two shapes.
 */
function unionShapes(
  openCascade: OpenCascadeInstance,
  shapeA: TopoDS_Shape,
  shapeB: TopoDS_Shape,
): TopoDS_Shape {
  const messageProgress = new openCascade.Message_ProgressRange_1();

  const fuse = new openCascade.BRepAlgoAPI_Fuse_3(shapeA, shapeB, messageProgress);

  fuse.Build(messageProgress);

  return fuse.Shape();
}

/**
 * Performs a difference of two shapes (shape1 - shape2).
 */
function differenceShapes(openCascade: OpenCascadeInstance, shape1: any, shape2: any): any {
  const messageProgress = new openCascade.Message_ProgressRange_1();
  const cut = new openCascade.BRepAlgoAPI_Cut_3(shape1, shape2, messageProgress);
  cut.Build(messageProgress);
  return cut.Shape();
}

/**
 * Performs an intersection of two shapes.
 */
function intersectionShapes(openCascade: OpenCascadeInstance, shape1: any, shape2: any): any {
  const messageProgress = new openCascade.Message_ProgressRange_1();
  const common = new openCascade.BRepAlgoAPI_Common_3(shape1, shape2, messageProgress);
  common.Build(messageProgress);
  return common.Shape();
}

/**
 * Translates a shape for assembly placement.
 * Exported for use in worker message handling.
 */
export function translateShapeForAssembly(
  openCascade: OpenCascadeInstance,
  shape: any,
  x: number,
  y: number,
  z: number,
): any {
  return translateShape(openCascade, shape, x, y, z);
}
