import { Logger, Node, TreeNodeOperation } from '@opentscad/types';
import type { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js/dist/opencascade.full';
import { triangulate } from './triangulate';
import { EvaluationStep } from './types';

/**
 * Evaluates the given node tree and returns a mesh tree with triangulated results for each node.
 *
 * @param openCascade the OpenCascade instance to use for shape operations
 * @param node the root node to evaluate
 * @param showIntermediateSteps whether to include intermediate steps in the mesh tree
 * @returns a mesh tree containing the complete hierarchy of meshes
 */
export function evaluateTree(openCascade: OpenCascadeInstance, node: Node, showIntermediateSteps: boolean): Array<EvaluationStep> {
  Logger.debug('[Worker] Evaluating node tree', { node, showIntermediateSteps });

  return evaluateNodeToMesh(openCascade, node, showIntermediateSteps);
}

/**
 * Evaluates a node in the tree and returns the corresponding mesh tree node.
 * This function recursively evaluates child nodes and builds the complete mesh hierarchy.
 *
 * @param openCascade the OpenCascade instance to use for shape creation and operations
 * @param node the node to evaluate
 * @param showIntermediateSteps whether to include intermediate steps in the mesh tree
 * @returns a mesh tree node containing the mesh and child nodes
 */
export function evaluateNodeToMesh(openCascade: OpenCascadeInstance, node: Node, showIntermediateSteps: boolean): Array<EvaluationStep> {
  Logger.debug('[Worker] Evaluating node to mesh', { nodeId: node.id });

  const shape = evaluateNode(openCascade, node);

  const triangulation = triangulate(openCascade, shape);

  const meshNode: EvaluationStep = { id: node.id, triangulation };

  if (showIntermediateSteps) {
    return [meshNode, ...collectChildNodes(node).flatMap((node) => evaluateNodeToMesh(openCascade, node, showIntermediateSteps))];
  } else {
    return [meshNode];
  }
}

/**
 * Evaluates a node in the tree and returns the corresponding shape.
 *
 * @param openCascade the OpenCascade instance to use for shape creation and operations
 * @param node the node to evaluate
 * @returns the resulting shape from evaluating the node and its children
 */
export function evaluateNode(openCascade: OpenCascadeInstance, node: Node): TopoDS_Shape {
  switch (node.operation) {
    case TreeNodeOperation.Box:
      return createBox(openCascade, node.params.width, node.params.height, node.params.depth);
    case TreeNodeOperation.Sphere:
      return createSphere(openCascade, node.params.radius);
    case TreeNodeOperation.Cylinder:
      return createCylinder(openCascade, node.params.radius, node.params.height);
    case TreeNodeOperation.Translate:
      return translateShape(openCascade, evaluateNode(openCascade, node.left), node.params.x, node.params.y, node.params.z);
    case TreeNodeOperation.Rotate:
      return rotateShape(openCascade, evaluateNode(openCascade, node.left), node.params.x, node.params.y, node.params.z);
    case TreeNodeOperation.Scale:
      return scaleShape(openCascade, evaluateNode(openCascade, node.left), node.params.x, node.params.y, node.params.z);
    case TreeNodeOperation.Union:
      return unionShapes(openCascade, evaluateNode(openCascade, node.left), evaluateNode(openCascade, node.right));
    case TreeNodeOperation.Difference:
      return differenceShapes(openCascade, evaluateNode(openCascade, node.target), evaluateNode(openCascade, node.tool));
  }
}

/**
 * Creates a box shape in OCP.
 */
function createBox(openCascade: OpenCascadeInstance, width: number, height: number, depth: number): TopoDS_Shape {
  return new openCascade.BRepPrimAPI_MakeBox_2(width, height, depth).Shape();
}

/**
 * Creates a sphere shape.
 */
function createSphere(openCascade: OpenCascadeInstance, radius: number): TopoDS_Shape {
  return new openCascade.BRepPrimAPI_MakeSphere_1(radius).Shape();
}

/**
 * Creates a cylinder shape.
 */
function createCylinder(openCascade: OpenCascadeInstance, radius: number, height: number): TopoDS_Shape {
  return new openCascade.BRepPrimAPI_MakeCylinder_1(radius, height).Shape();
}

/**
 * Translates a shape by the given distance.
 */
function translateShape(openCascade: OpenCascadeInstance, shape: TopoDS_Shape, x: number, y: number, z: number): TopoDS_Shape {
  const trsf = new openCascade.gp_Trsf_1();

  const vec = new openCascade.gp_Vec_4(x, y, z);
  trsf.SetTranslation_1(vec);

  return new openCascade.BRepBuilderAPI_Transform_2(shape, trsf, false).Shape();
}

/**
 * Rotates a shape by the given angles (in degrees) around each axis.
 */
function rotateShape(openCascade: OpenCascadeInstance, shape: TopoDS_Shape, x: number, y: number, z: number): TopoDS_Shape {
  let rotated = shape;

  // Rotate around X axis
  if (x !== 0) {
    const trsf = new openCascade.gp_Trsf_1();
    const axis = new openCascade.gp_Ax1_2(new openCascade.gp_Pnt_3(0, 0, 0), new openCascade.gp_Dir_4(1, 0, 0));

    trsf.SetRotation_1(axis, (x * Math.PI) / 180);
    rotated = new openCascade.BRepBuilderAPI_Transform_2(rotated, trsf, false).Shape();
  }

  // Rotate around Y axis
  if (y !== 0) {
    const trsf = new openCascade.gp_Trsf_1();
    const axis = new openCascade.gp_Ax1_2(new openCascade.gp_Pnt_3(0, 0, 0), new openCascade.gp_Dir_4(0, 1, 0));
    trsf.SetRotation_1(axis, (y * Math.PI) / 180);
    rotated = new openCascade.BRepBuilderAPI_Transform_2(rotated, trsf, false).Shape();
  }

  // Rotate around Z axis
  if (z !== 0) {
    const trsf = new openCascade.gp_Trsf_1();
    const axis = new openCascade.gp_Ax1_2(new openCascade.gp_Pnt_3(0, 0, 0), new openCascade.gp_Dir_4(0, 0, 1));
    trsf.SetRotation_1(axis, (z * Math.PI) / 180);
    rotated = new openCascade.BRepBuilderAPI_Transform_2(rotated, trsf, false).Shape();
  }

  return rotated;
}

/**
 * Scales a shape by the given factors.
 */
function scaleShape(openCascade: OpenCascadeInstance, shape: TopoDS_Shape, x: number, y: number, z: number): TopoDS_Shape {
  const uniformScale = (x + y + z) / 3;

  const trsf = new openCascade.gp_Trsf_1();
  trsf.SetScale(new openCascade.gp_Pnt_3(0, 0, 0), uniformScale);

  return new openCascade.BRepBuilderAPI_Transform_2(shape, trsf, false).Shape();
}

/**
 * Performs a union of two shapes.
 */
function unionShapes(openCascade: OpenCascadeInstance, shapeA: TopoDS_Shape, shapeB: TopoDS_Shape): TopoDS_Shape {
  const messageProgress = new openCascade.Message_ProgressRange_1();

  const fuse = new openCascade.BRepAlgoAPI_Fuse_3(shapeA, shapeB, messageProgress);

  fuse.Build(messageProgress);

  return fuse.Shape();
}

/**
 * Performs a difference of two shapes (shape1 - shape2).
 */
function differenceShapes(openCascade: OpenCascadeInstance, shape1: TopoDS_Shape, shape2: TopoDS_Shape): TopoDS_Shape {
  const messageProgress = new openCascade.Message_ProgressRange_1();
  const cut = new openCascade.BRepAlgoAPI_Cut_3(shape1, shape2, messageProgress);
  cut.Build(messageProgress);
  return cut.Shape();
}

/**
 * Collects child nodes from a given node based on its operation type.
 *
 * @param node the node to extract children from
 * @returns an array of child nodes
 */
function collectChildNodes(node: Node): Node[] {
  switch (node.operation) {
    case TreeNodeOperation.Union:
      return 'left' in node && 'right' in node ? [node.left, node.right] : [];
    case TreeNodeOperation.Difference:
      return 'target' in node && 'tool' in node ? [node.target, node.tool] : [];
    case TreeNodeOperation.Translate:
    case TreeNodeOperation.Rotate:
    case TreeNodeOperation.Scale:
      return 'left' in node ? [node.left] : [];
    default:
      return [];
  }
}
