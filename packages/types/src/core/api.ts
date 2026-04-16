import { v4 as uuidv4 } from 'uuid';
import { Node, TreeNodeOperation } from './tree';

/**
 * Create a box
 *
 * @param width
 * @param height
 * @param depth
 * @returns a new box
 */
export function box(width: number, height: number, depth: number): Shape {
  return new Shape({
    id: uuidv4(),
    operation: TreeNodeOperation.Box,
    params: { width, height, depth },
  });
}

/**
 * Create a sphere
 *
 * @param radius
 * @returns a new sphere
 */
export function sphere(radius: number): Shape {
  return new Shape({
    id: uuidv4(),
    operation: TreeNodeOperation.Sphere,
    params: { radius },
  });
}

/**
 * Create a cylinder
 *
 * @param radius
 * @param height
 * @returns a new cylinder
 */
export function cylinder(radius: number, height: number): Shape {
  return new Shape({
    id: uuidv4(),
    operation: TreeNodeOperation.Cylinder,
    params: { radius, height },
  });
}

/**
 * Union multiple shapes
 *
 * @param shapes
 * @returns the combined shape
 */
export function union(...shapes: Array<Shape>): Shape {
  return shapes.reduce((acc, shape) => {
    if (!acc) {
      return shape;
    }

    return new Shape({
      id: uuidv4(),
      operation: TreeNodeOperation.Union,
      left: acc.node,
      right: shape.node,
    });
  });
}

/**
 * Subtract one shape from another
 *
 * @param target the shape to subtract from
 * @param tool the shape to subtract
 * @returns the resulting shape after subtraction
 */
export function difference(target: Shape, tool: Shape): Shape {
  return new Shape({
    id: uuidv4(),
    operation: TreeNodeOperation.Difference,
    target: target.node,
    tool: tool.node,
  });
}

/**
 * Base class for all shapes and operations in the API. Each shape or operation corresponds to a node in the tree
 */
export class Shape {
  /**
   * The node representing the shape or operation in the tree
   */
  public readonly node: Node;

  public constructor(node: Node) {
    this.node = node;
  }

  /**
   * Translate the shape or operation by the given offsets
   *
   * @param x the distance to translate along the x-axis
   * @param y the distance to translate along the y-axis
   * @param z the distance to translate along the z-axis
   * @returns a new shape
   */
  public translate(x: number, y: number, z: number): Shape {
    return new Shape({
      id: uuidv4(),
      operation: TreeNodeOperation.Translate,
      params: { x, y, z },
      left: this.node,
    });
  }

  /**
   * Rotate the shape or operation by the given angles (in degrees) around each axis
   *
   * @param x the angle to rotate around the x-axis
   * @param y the angle to rotate around the y-axis
   * @param z the angle to rotate around the z-axis
   * @returns a new shape representing the rotated shape or operation
   */
  public rotate(x: number, y: number, z: number): Shape {
    return new Shape({
      id: uuidv4(),
      operation: TreeNodeOperation.Rotate,
      params: { x, y, z },
      left: this.node,
    });
  }

  /**
   * Scale the shape or operation by the given factors along each axis
   *
   * @param x the scale factor along the x-axis
   * @param y the scale factor along the y-axis
   * @param z the scale factor along the z-axis
   * @returns a new shape representing the scaled shape or operation
   */
  public scale(x: number, y: number, z: number): Shape {
    return new Shape({
      id: uuidv4(),
      operation: TreeNodeOperation.Scale,
      params: { x, y, z },
      left: this.node,
    });
  }
}

/**
 * Helper type to ensure that all operations have a corresponding API function defined
 */
type EnsureEachOperationHasAnAPIFunction = {
  [TreeNodeOperation.Box]: typeof box;
  [TreeNodeOperation.Sphere]: typeof sphere;
  [TreeNodeOperation.Cylinder]: typeof cylinder;
  [TreeNodeOperation.Translate]: typeof Shape.prototype.translate;
  [TreeNodeOperation.Rotate]: typeof Shape.prototype.rotate;
  [TreeNodeOperation.Scale]: typeof Shape.prototype.scale;
  [TreeNodeOperation.Union]: typeof union;
  [TreeNodeOperation.Difference]: typeof difference;
}[TreeNodeOperation];
