import type { Component } from "./assembly";
import { Operation, OperationParameters } from "./operations";

/**
 * The types of nodes in the AST.
 */
export enum AstNode {
  /**
   * An assembly node, which can contain multiple components.
   */
  Assembly = "assembly",

  /**
   * A component node, which represents a single shape or an operation on shapes.
   */
  Component = "component",
}

interface BaseNode<NodeType extends AstNode> {
  /**
   * Unique identifier for the node.
   */
  id: string;

  /**
   * The type of the node.
   */
  type: NodeType;
}

/**
 * Helper type to recursively convert Component references to AstComponentNode references in operation parameters.
 */
type AstOperationParameters<OperationType extends Operation> =
  OperationParameters<OperationType> extends Record<string, any>
    ? {
        [K in keyof OperationParameters<OperationType>]: OperationParameters<OperationType>[K] extends Component
          ? AstComponentNode
          : OperationParameters<OperationType>[K] extends Component[]
            ? AstComponentNode[]
            : OperationParameters<OperationType>[K];
      }
    : OperationParameters<OperationType>;

/**
 * Represents a single component in the assembly, which can be a shape or an operation on shapes.
 * Uses a discriminated union to represent different operations with their specific parameters while sharing common node properties.
 * This is necessary for correct type narrowing in switch cases
 */
export type AstComponentNode = {
  [OperationType in Operation]: {
    /**
     * The specific operation this component represents, such as a shape primitive or a boolean operation.
     */
    operation: OperationType;

    /**
     * The parameters for the operation, with Component references converted to AstComponentNode.
     */
    params: AstOperationParameters<OperationType>;
  } & BaseNode<AstNode.Component>;
}[Operation];

/**
 * Represents an assembly, which can contain multiple components.
 */
export interface AstAssemblyNode extends BaseNode<AstNode.Assembly> {
  /**
   * The name of the assembly.
   */
  name: string;

  /**
   * The components of the assembly.
   */
  components: Array<AstComponentNode>;
}
