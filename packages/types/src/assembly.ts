import { AstAssemblyNode, AstComponentNode, AstNode } from "./ast";
import { Operation, OperationParameters } from "./operations";

/**
 * Enum for the different types of nodes in the assembly tree.
 */
export enum Node {
  /**
   * An assembly node, which can contain multiple components.
   */
  Assembly = "assembly",

  /**
   * A component node, which represents a single shape or an operation on shapes.
   */
  Component = "component",
}

/**
 * Represents a single component in the assembly, which can be a shape or an operation on shapes.
 */
export class Component<OperationType extends Operation = Operation> {
  /**
   * Unique identifier for the component.
   */
  readonly #id: string;

  /**
   * The type of the node, which is always Node.Component for this class.
   */
  readonly #type: Node = Node.Component;

  /**
   * The specific operation this component represents, such as a shape primitive or a boolean operation.
   */
  readonly #operation: OperationType;

  /**
   * Parameters for the operation, which can include dimensions for shapes or references to other components for operations.
   */
  readonly #params: OperationParameters<OperationType>;

  public constructor(
    id: string,
    operation: OperationType,
    params: OperationParameters<OperationType>,
  ) {
    this.#id = id;
    this.#operation = operation;
    this.#params = params;
  }

  /**
   * Translates the component by the given offsets.
   *
   * @param x the distance to translate along the x-axis.
   * @param y the distance to translate along the y-axis.
   * @param z the distance to translate along the z-axis.
   * @returns a new component representing the translated shape.
   */
  public translate(x: number, y: number, z: number) {
    return new Component(
      Math.random().toString(36).substring(7),
      Operation.Translate,
      { x, y, z, component: this },
    );
  }

  /**
   * Rotates the component by the given angles (in degrees) around each axis.
   *
   * @param x the angle to rotate around the x-axis.
   * @param y the angle to rotate around the y-axis.
   * @param z the angle to rotate around the z-axis.
   * @returns a new component representing the rotated shape.
   */
  public rotate(x: number, y: number, z: number) {
    return new Component(
      Math.random().toString(36).substring(7),
      Operation.Rotate,
      { x, y, z, component: this },
    );
  }

  /**
   * Scales the component by the given factors.
   *
   * @param x the factor to scale along the x-axis.
   * @param y the factor to scale along the y-axis.
   * @param z the factor to scale along the z-axis.
   * @returns a new component representing the scaled shape.
   */
  public scale(x: number, y: number, z: number) {
    return new Component(
      Math.random().toString(36).substring(7),
      Operation.Scale,
      { x, y, z, component: this },
    );
  }

  /**
   * Converts the component to a plain object representation.
   *
   * @returns a plain object representation of the component.
   */
  public toAstNode(): AstComponentNode {
    // ! TODO: extract this elsewhere, this shouldnt be part of the api !
    const convertedParams: Record<string, any> = {};

    for (const [key, value] of Object.entries(this.#params)) {
      if (value instanceof Component) {
        // Convert single component reference
        convertedParams[key] = value.toAstNode();
      } else if (Array.isArray(value)) {
        // Convert arrays of components
        convertedParams[key] = value.map((item) =>
          item instanceof Component ? item.toAstNode() : item,
        );
      } else {
        // Keep other values as-is
        convertedParams[key] = value;
      }
    }

    return {
      id: this.#id,
      type: AstNode.Component,
      operation: this.#operation,
      params: convertedParams,
    } as AstComponentNode;
  }
}

/**
 * Represents an assembly, which is a collection of components that can be combined to form a complex shape.
 */
export class Assembly {
  /**
   * Unique identifier for the assembly.
   */
  readonly #id: string;

  /**
   * Name of the assembly.
   */
  readonly #name: string;

  /**
   * Type of the assembly, which is always Node.Assembly for this class.
   */
  readonly #type: Node = Node.Assembly;

  /**
   * Components that make up the assembly.
   */
  readonly #components: Array<Component>;

  public constructor(name: string, components: Array<Component> = []) {
    this.#id = Math.random().toString(36).substring(7);
    this.#name = name;
    this.#components = components;
  }

  /**
   * Places a component into the assembly.
   *
   * @param component the component to place in the assembly.
   * @returns the updated assembly instance.
   */
  public placeComponent(component: Component): this {
    this.#components.push(component);
    return this;
  }

  /**
   * Converts the assembly to a plain object representation.
   *
   * @returns a plain object representation of the assembly.
   */
  public toAstNode(): AstAssemblyNode {
    // ! TODO: extract this elsewhere, this shouldnt be part of the api !
    return {
      id: this.#id,
      name: this.#name,
      type: AstNode.Assembly,
      components: this.#components.map((component) => component.toAstNode()),
    };
  }
}

/**
 * Creates a cylinder component.
 *
 * @param radius the radius of the cylinder.
 * @param height the height of the cylinder.
 * @returns a new cylinder component.
 */
export function cylinder(radius: number, height: number): Component {
  return new Component(
    Math.random().toString(36).substring(7),
    Operation.Cylinder,
    { radius, height },
  );
}

/**
 * Creates a box component.
 *
 * @param width the width of the box.
 * @param height the height of the box.
 * @param depth the depth of the box.
 * @returns a new box component.
 */
export function box(width: number, height: number, depth: number): Component {
  return new Component(Math.random().toString(36).substring(7), Operation.Box, {
    width,
    height,
    depth,
  });
}

/**
 * Difference between two components.
 *
 * @param target the component to subtract from.
 * @param tools the components to subtract.
 */
export function difference(
  target: Component,
  ...tools: Array<Component>
): Component {
  return new Component(
    Math.random().toString(36).substring(7),
    Operation.Difference,
    { target, tools },
  );
}

/**
 * Union of multiple components.
 *
 * @param components the components to union.
 */
export function union(...components: Array<Component>): Component {
  return new Component(
    Math.random().toString(36).substring(7),
    Operation.Union,
    { components },
  );
}

/**
 * Creates a new assembly.
 *
 * @param name the name of the assembly.
 * @returns a new assembly instance.
 */
export function assembly(name: string): Assembly {
  return new Assembly(name);
}
