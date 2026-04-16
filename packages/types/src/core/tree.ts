/**
 * Structure of a tree of operationes. Example:
 * ```md
 *              ┌────────────────┐
 *              |     Union      |
 *              ├────────────────┤
 *              │ id: aXmeQflaR, │
 *              │ op: box,       │
 *              └────────────────┘
 *                 ^           ^
 *                 |           |
 *                 |           |
 * ┌─────────────────┐       ┌─────────────────┐
 * |    Translate    |       |     Sphere      |
 * ├─────────────────┤       ├─────────────────┤
 * │ id: KLwnOIqA,   │       │ id: verAwbba,   │
 * │ op: translate,  │       │ op: sphere,     │
 * │ params: {       │       │ params: {       │
 * │   x: 10,        │       │   radius: 5     │
 * │   y: 10,        │       │ }               │
 * │   z: 10         │       └─────────────────┘
 * │ }               │
 * └─────────────────┘
 *         ^
 *         |
 *         |
 * ┌─────────────────┐
 * |      Box        |
 * ├─────────────────┤
 * │ id: aXmeQflaR,  │
 * │ op: box,        │
 * │ params: {       |
 * │   width: 10,    |
 * │   height: 10,   |
 * │   depth: 10     |
 * │ }               │
 * └─────────────────┘
 * ```
 */
interface TreeNode<Operation extends TreeNodeOperation> {
  /**
   * Unique identifier for the node.
   */
  readonly id: string;

  /**
   * The operation of this node
   */
  readonly operation: Operation;
}

/**
 * The operation of a step in the model.
 * This can be a transformation (translate, rotate, scale)
 * or a primitive shape (box, cube, sphere, cylinder)
 * or a boolean operation (union, difference, intersection).
 */
export enum TreeNodeOperation {
  Translate = 'translate',
  Rotate = 'rotate',
  Scale = 'scale',
  Union = 'union',
  Difference = 'difference',
  Box = 'box',
  Sphere = 'sphere',
  Cylinder = 'cylinder',
}

/**
 * Helper type to ensure that all operations have a corresponding node type defined.
 */
type EnsureEachOperationHasATreeNode = {
  [TreeNodeOperation.Box]: BoxNode;
  [TreeNodeOperation.Sphere]: SphereNode;
  [TreeNodeOperation.Cylinder]: CylinderNode;
  [TreeNodeOperation.Translate]: TranslateNode;
  [TreeNodeOperation.Rotate]: RotateNode;
  [TreeNodeOperation.Scale]: ScaleNode;
  [TreeNodeOperation.Union]: UnionNode;
  [TreeNodeOperation.Difference]: DifferenceNode;
}[TreeNodeOperation];

/**
 * Primitive shape node to create a simple box.
 */
export interface BoxNode extends TreeNode<TreeNodeOperation.Box> {
  /**
   * The parameters for the box.
   */
  params: {
    /**
     * The width of the box along the X-axis.
     */
    width: number;

    /**
     * The height of the box along the Y-axis.
     */
    height: number;

    /**
     * The depth of the box along the Z-axis.
     */
    depth: number;
  };
}

/**
 * Primitive shape node to create a simple sphere.
 */
export interface SphereNode extends TreeNode<TreeNodeOperation.Sphere> {
  /**
   * The parameters for the sphere.
   */
  params: {
    /**
     * The radius of the sphere.
     */
    radius: number;
  };
}

/**
 * Primitive shape node to create a simple cylinder.
 */
export interface CylinderNode extends TreeNode<TreeNodeOperation.Cylinder> {
  /**
   * The parameters for the cylinder.
   */
  params: {
    /**
     * The radius of the cylinder.
     */
    radius: number;

    /**
     * The height of the cylinder.
     */
    height: number;
  };
}

/**
 * Transformation node to translate a shape.
 */
export interface TranslateNode extends TreeNode<TreeNodeOperation.Translate> {
  /**
   * The parameters for the translation.
   */
  params: {
    /**
     * The distance to translate along the X-axis.
     */
    x: number;

    /**
     * The distance to translate along the Y-axis.
     */
    y: number;

    /**
     * The distance to translate along the Z-axis.
     */
    z: number;
  };

  /**
   * The shape to translate.
   */
  left: Node;
}

/**
 * Transformation node to rotate a shape.
 */
export interface RotateNode extends TreeNode<TreeNodeOperation.Rotate> {
  /**
   * The parameters for the rotation.
   */
  params: {
    /**
     * The angle to rotate around the X-axis.
     */
    x: number;

    /**
     * The angle to rotate around the Y-axis.
     */
    y: number;

    /**
     * The angle to rotate around the Z-axis.
     */
    z: number;
  };

  /**
   * The shape to rotate.
   */
  left: Node;
}

/**
 * Transformation node to scale a shape.
 */
export interface ScaleNode extends TreeNode<TreeNodeOperation.Scale> {
  /**
   * The parameters for the scaling.
   */
  params: {
    /**
     * The factor to scale along the X-axis.
     */
    x: number;

    /**
     * The factor to scale along the Y-axis.
     */
    y: number;

    /**
     * The factor to scale along the Z-axis.
     */
    z: number;
  };

  /**
   * The shape to scale.
   */
  left: Node;
}

/**
 * Boolean operation node to union two shapes.
 */
export interface UnionNode extends TreeNode<TreeNodeOperation.Union> {
  /**
   * The left shape to union.
   */
  left: Node;

  /**
   * The right shape to union.
   */
  right: Node;
}

/**
 * Boolean operation node to difference two shapes.
 */
export interface DifferenceNode extends TreeNode<TreeNodeOperation.Difference> {
  /**
   * The target shape to subtract from.
   */
  target: Node;

  /**
   * The tool shape to use for the subtraction.
   */
  tool: Node;
}

/**
 * A node in the tree of operations.
 * Discriminated union of all possible node types for type narrowing.
 */
export type Node = BoxNode | SphereNode | CylinderNode | TranslateNode | RotateNode | ScaleNode | UnionNode | DifferenceNode;

/**
 * Type guard to narrow down to tree node.
 *
 * @param node the object to check
 * @returns true if the node is a valid TreeNode, false otherwise
 */
function isTreeNode<Operation extends TreeNodeOperation>(node: unknown): node is TreeNode<Operation> {
  if (typeof node !== 'object' || node === null || node === undefined) {
    return false;
  }

  const hasId = 'id' in node && typeof node.id === 'string';

  const hasOperation =
    'operation' in node &&
    typeof node.operation === 'string' &&
    Object.values(TreeNodeOperation).includes(node.operation as TreeNodeOperation);

  return hasId && hasOperation;
}

/**
 * Type guard to narrow down to a specific node type.
 *
 * @param node the object to check
 * @returns true if the node is a valid Node, false otherwise
 */
export function isNode(node: unknown): node is Node {
  if (!isTreeNode(node)) {
    return false;
  }

  return nodeTypeGuards[node.operation](node);
}

/**
 * Mapping of tree node operations to their corresponding type guards for type narrowing.
 */
const nodeTypeGuards: {
  [Operation in TreeNodeOperation]: (node: TreeNode<TreeNodeOperation>) => node is Extract<Node, { operation: Operation }>;
} = {
  [TreeNodeOperation.Box]: isBoxNode,
  [TreeNodeOperation.Sphere]: isSphereNode,
  [TreeNodeOperation.Cylinder]: isCylinderNode,
  [TreeNodeOperation.Translate]: isTranslateNode,
  [TreeNodeOperation.Rotate]: isRotateNode,
  [TreeNodeOperation.Scale]: isScaleNode,
  [TreeNodeOperation.Union]: isUnionNode,
  [TreeNodeOperation.Difference]: isDifferenceNode,
};

/**
 * Type guard to narrow down to box node.
 *
 * @param node the object to check
 * @returns true if the node is a valid BoxNode, false otherwise
 */
function isBoxNode(node: TreeNode<TreeNodeOperation>): node is BoxNode {
  if (node.operation !== TreeNodeOperation.Box) {
    return false;
  }

  if (!('params' in node) || typeof node.params !== 'object' || node.params === null) {
    return false;
  }

  const hasWidth = 'width' in node.params && typeof node.params.width === 'number';
  const hasHeight = 'height' in node.params && typeof node.params.height === 'number';
  const hasDepth = 'depth' in node.params && typeof node.params.depth === 'number';

  return hasWidth && hasHeight && hasDepth;
}

/**
 * Type guard to narrow down to sphere node.
 *
 * @param node the object to check
 * @returns true if the node is a valid SphereNode, false otherwise
 */
function isSphereNode(node: TreeNode<TreeNodeOperation>): node is SphereNode {
  if (node.operation !== TreeNodeOperation.Sphere) {
    return false;
  }

  if (!('params' in node) || typeof node.params !== 'object' || node.params === null) {
    return false;
  }

  const hasRadius = 'radius' in node.params && typeof node.params.radius === 'number';

  return hasRadius;
}

/**
 * Type guard to narrow down to cylinder node.
 *
 * @param node the object to check
 * @returns true if the node is a valid CylinderNode, false otherwise
 */
function isCylinderNode(node: TreeNode<TreeNodeOperation>): node is CylinderNode {
  if (node.operation !== TreeNodeOperation.Cylinder) {
    return false;
  }

  if (!('params' in node) || typeof node.params !== 'object' || node.params === null) {
    return false;
  }

  const hasRadius = 'radius' in node.params && typeof node.params.radius === 'number';
  const hasHeight = 'height' in node.params && typeof node.params.height === 'number';

  return hasRadius && hasHeight;
}

/**
 * Type guard to narrow down to translate node.
 *
 * @param node the object to check
 * @returns true if the node is a valid TranslateNode, false otherwise
 */
function isTranslateNode(node: TreeNode<TreeNodeOperation>): node is TranslateNode {
  if (node.operation !== TreeNodeOperation.Translate) {
    return false;
  }

  if (!('left' in node) || !isNode(node.left)) {
    return false;
  }

  if (!('params' in node) || typeof node.params !== 'object' || node.params === null) {
    return false;
  }

  const hasX = 'x' in node.params && typeof node.params.x === 'number';
  const hasY = 'y' in node.params && typeof node.params.y === 'number';
  const hasZ = 'z' in node.params && typeof node.params.z === 'number';

  return hasX && hasY && hasZ;
}

/**
 * Type guard to narrow down to rotate node.
 *
 * @param node the object to check
 * @returns true if the node is a valid RotateNode, false otherwise
 */
function isRotateNode(node: TreeNode<TreeNodeOperation>): node is RotateNode {
  if (node.operation !== TreeNodeOperation.Rotate) {
    return false;
  }

  if (!('left' in node) || !isNode(node.left)) {
    return false;
  }

  if (!('params' in node) || typeof node.params !== 'object' || node.params === null) {
    return false;
  }

  const hasX = 'x' in node.params && typeof node.params.x === 'number';
  const hasY = 'y' in node.params && typeof node.params.y === 'number';
  const hasZ = 'z' in node.params && typeof node.params.z === 'number';

  return hasX && hasY && hasZ;
}

/**
 * Type guard to narrow down to scale node.
 *
 * @param node the object to check
 * @returns true if the node is a valid ScaleNode, false otherwise
 */
function isScaleNode(node: TreeNode<TreeNodeOperation>): node is ScaleNode {
  if (node.operation !== TreeNodeOperation.Scale) {
    return false;
  }

  if (!('left' in node) || !isNode(node.left)) {
    return false;
  }

  if (!('params' in node) || typeof node.params !== 'object' || node.params === null) {
    return false;
  }

  const hasX = 'x' in node.params && typeof node.params.x === 'number';
  const hasY = 'y' in node.params && typeof node.params.y === 'number';
  const hasZ = 'z' in node.params && typeof node.params.z === 'number';

  return hasX && hasY && hasZ;
}

/**
 * Type guard to narrow down to union node.
 *
 * @param node the object to check
 * @returns true if the node is a valid UnionNode, false otherwise
 */
function isUnionNode(node: TreeNode<TreeNodeOperation>): node is UnionNode {
  if (node.operation !== TreeNodeOperation.Union) {
    return false;
  }

  if (!('left' in node) || !isNode(node.left)) {
    return false;
  }

  if (!('right' in node) || !isNode(node.right)) {
    return false;
  }

  return true;
}

/**
 * Type guard to narrow down to difference node.
 *
 * @param node the object to check
 * @returns true if the node is a valid DifferenceNode, false otherwise
 */
function isDifferenceNode(node: TreeNode<TreeNodeOperation>): node is DifferenceNode {
  if (node.operation !== TreeNodeOperation.Difference) {
    return false;
  }

  if (!('target' in node) || !isNode(node.target)) {
    return false;
  }

  if (!('tool' in node) || !isNode(node.tool)) {
    return false;
  }

  return true;
}
